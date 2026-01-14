import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { Send } from 'lucide-react'
import { Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function ChatWindow({ recipientId, recipientName, recipientAvatar }) {
    const { user } = useAuth()
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [contextMenu, setContextMenu] = useState(null) // { x, y, messageId }
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
                    setMessages(prev => {
                        if (prev.find(m => m.id === payload.new.id)) return prev
                        return [...prev, payload.new]
                    })
                }
            })
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `sender_id=eq.${user.id}`
            }, (payload) => {
                if (payload.new.receiver_id === recipientId) {
                    setMessages(prev => {
                        // Check if we have this message (either by real ID or by optimistic match if we could, but unique ID is safest)
                        if (prev.find(m => m.id === payload.new.id)) return prev
                        return [...prev, payload.new]
                    })
                }
            })
            .subscribe()
    }

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!newMessage.trim()) return

        const messageContent = newMessage
        setNewMessage('') // Clear input immediately

        // Optimistic Update
        const optimisticMsg = {
            id: 'temp-' + Date.now(),
            sender_id: user.id,
            receiver_id: recipientId,
            content: messageContent,
            created_at: new Date().toISOString(),
            is_read: false
        }
        setMessages(prev => [...prev, optimisticMsg])

        const { data, error } = await supabase.from('messages').insert({
            sender_id: user.id,
            receiver_id: recipientId,
            content: messageContent
        }).select()

        if (error) {
            toast.error("Failed to send message")
            setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id)) // Rollback
            setNewMessage(messageContent) // Restore text
        } else {
            // Replace temp message with real one to get real ID
            if (data && data[0]) {
                setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? data[0] : m))
            }
        }
    }

    const handleDeleteMessage = async () => {
        if (!contextMenu) return
        const messageId = contextMenu.messageId
        setContextMenu(null)

        const { error } = await supabase
            .from('messages')
            .delete()
            .eq('id', messageId)

        if (error) {
            toast.error("Failed to delete message")
        } else {
            toast.success("Message deleted")
            setMessages(prev => prev.filter(m => m.id !== messageId))
        }
    }

    const handleContextMenu = (e, messageId) => {
        e.preventDefault()
        setContextMenu({
            x: e.pageX,
            y: e.pageY,
            messageId
        })
    }

    useEffect(() => {
        const handleClick = () => setContextMenu(null)
        document.addEventListener('click', handleClick)
        return () => document.removeEventListener('click', handleClick)
    }, [])

    return (
        <div className="flex flex-col h-[600px] border border-base-200 rounded-xl bg-base-100 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-base-200 p-4 border-b border-base-300 flex items-center gap-3">
                <div className="avatar">
                    <div className="w-10 rounded-full">
                        <img
                            src={recipientAvatar || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}
                            alt={recipientName}
                            className="w-full h-full object-cover"
                        />
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
                            <div
                                onContextMenu={(e) => handleContextMenu(e, msg.id)}
                                className={`chat-bubble cursor-pointer ${isMe ? 'chat-bubble-primary' : 'chat-bubble-secondary'}`}
                            >
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

            {/* Context Menu */}
            {contextMenu && (
                <div
                    className="fixed z-50 bg-base-100 border border-base-200 shadow-xl rounded-lg py-1 w-40"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    <button
                        onClick={handleDeleteMessage}
                        className="w-full text-left px-4 py-2 hover:bg-error/10 text-error flex items-center gap-2 text-sm"
                    >
                        <Trash2 size={16} /> Delete
                    </button>
                </div>
            )}

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
