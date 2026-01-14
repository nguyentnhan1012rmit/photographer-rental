import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { Send } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function ChatWindow({ recipientId, recipientName, recipientAvatar }) {
    const { user } = useAuth()
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const messagesEndRef = useRef(null)

    useEffect(() => {
        if (user && recipientId) {
            fetchMessages()
            const subscription = subscribeToMessages()
            return () => {
                subscription.unsubscribe()
            }
        }
    }, [user, recipientId])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const fetchMessages = async () => {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${user.id},receiver_id.eq.${recipientId}),and(sender_id.eq.${recipientId},receiver_id.eq.${user.id})`)
            .order('created_at', { ascending: true })

        if (error) console.error('Error fetching messages:', error)
        else setMessages(data || [])
    }

    const subscribeToMessages = () => {
        return supabase
            .channel('public:messages')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `receiver_id=eq.${user.id}`
            }, (payload) => {
                if (payload.new.sender_id === recipientId) {
                    setMessages(prev => [...prev, payload.new])
                }
            })
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `sender_id=eq.${user.id}`
            }, (payload) => {
                if (payload.new.receiver_id === recipientId) {
                    setMessages(prev => [...prev, payload.new])
                }
            })
            .subscribe()
    }

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!newMessage.trim()) return

        const { error } = await supabase.from('messages').insert({
            sender_id: user.id,
            receiver_id: recipientId,
            content: newMessage
        })

        if (error) {
            toast.error("Failed to send message")
        } else {
            setNewMessage('')
        }
    }

    return (
        <div className="flex flex-col h-[600px] border border-base-200 rounded-xl bg-base-100 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-base-200 p-4 border-b border-base-300 flex items-center gap-3">
                <div className="avatar">
                    <div className="w-10 rounded-full">
                        {recipientAvatar ? <img src={recipientAvatar} /> : <div className="bg-primary text-primary-content w-full h-full flex items-center justify-center font-bold">{recipientName?.[0]}</div>}
                    </div>
                </div>
                <h3 className="font-bold">{recipientName}</h3>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-base-100">
                {messages.length === 0 && (
                    <div className="text-center opacity-50 mt-20">No messages yet. Say hi! 👋</div>
                )}
                {messages.map(msg => {
                    const isMe = msg.sender_id === user.id
                    return (
                        <div key={msg.id} className={`chat ${isMe ? 'chat-end' : 'chat-start'}`}>
                            <div className={`chat-bubble ${isMe ? 'chat-bubble-primary' : 'chat-bubble-secondary'}`}>
                                {msg.content}
                            </div>
                            <div className="chat-footer opacity-50 text-xs mt-1">
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-base-200 border-t border-base-300 flex gap-2">
                <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                />
                <button className="btn btn-primary btn-square">
                    <Send size={20} />
                </button>
            </form>
        </div>
    )
}
