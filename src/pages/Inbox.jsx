import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import ChatWindow from '../components/ChatWindow'
import { MessageSquare } from 'lucide-react'
import { useLocation } from 'react-router-dom'

export default function Inbox() {
    const { user } = useAuth()
    const location = useLocation()
    const [conversations, setConversations] = useState([])
    const [selectedUser, setSelectedUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            fetchConversations().then((data) => {
                // Check if we need to start a specific chat
                if (location.state?.startChatWith) {
                    const target = location.state.startChatWith
                    if (target.id === user.id) return // Can't chat with self

                    const existing = data.find(c => c.id === target.id)
                    if (existing) {
                        setSelectedUser(existing)
                    } else {
                        // Add temporary conversation item
                        const newConvo = {
                            id: target.id,
                            full_name: target.full_name,
                            avatar_url: target.avatar_url,
                            lastMessage: 'New conversation',
                            lastMessageDate: new Date().toISOString()
                        }
                        setConversations(prev => [newConvo, ...prev])
                        setSelectedUser(newConvo)
                    }
                }
            })

            const subscription = subscribeToNewMessages()
            return () => {
                subscription.unsubscribe()
            }
        }
    }, [user, location.state])

    const subscribeToNewMessages = () => {
        return supabase
            .channel('public:inbox')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `receiver_id=eq.${user.id}`
            }, async (payload) => {
                handleNewMessage(payload.new, payload.new.sender_id)
            })
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `sender_id=eq.${user.id}`
            }, async (payload) => {
                // Update inbox when I send a message too
                handleNewMessage(payload.new, payload.new.receiver_id)
            })
            .subscribe()
    }

    const handleNewMessage = async (newMessage, partnerId) => {
        setConversations(prev => {
            const existingIndex = prev.findIndex(c => c.id === partnerId)
            if (existingIndex >= 0) {
                const updated = { ...prev[existingIndex], lastMessage: newMessage.content, lastMessageDate: newMessage.created_at }
                const newList = [...prev]
                newList.splice(existingIndex, 1)
                return [updated, ...newList]
            } else {
                return prev // Wait for fetch
            }
        })

        // Check if we need to fetch profile (only if not found above)
        // We can't robustly check "if not found" inside the async callback easily without race conditions on 'prev', 
        // effectively we just fetch if we suspect it might be new, or we can just rely on the fact that if we sent it, we probably know them.
        // For incoming:
        if (newMessage.sender_id === partnerId) {
            const { data: senderProfile } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url')
                .eq('id', partnerId)
                .single()

            if (senderProfile) {
                setConversations(prev => {
                    if (prev.find(c => c.id === partnerId)) return prev
                    const newConvo = {
                        ...senderProfile,
                        lastMessage: newMessage.content,
                        lastMessageDate: newMessage.created_at
                    }
                    return [newConvo, ...prev]
                })
            }
        }
    }

    const fetchConversations = async () => {
        // This is a bit complex in SQL. We need to find unique users we've chatted with.
        // A simple way is to fetch distinct sender_ids where receiver is me, 
        // AND distinct receiver_ids where sender is me.

        setLoading(true)

        // 1. Get messages where I am involved
        const { data: messages } = await supabase
            .from('messages')
            .select('sender_id, receiver_id, created_at, content')
            .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
            .order('created_at', { ascending: false })

        if (!messages) {
            setLoading(false)
            return []
        }

        // 2. Extract unique User IDs interacting with me
        const userIds = new Set()
        messages.forEach(msg => {
            if (msg.sender_id !== user.id) userIds.add(msg.sender_id)
            if (msg.receiver_id !== user.id) userIds.add(msg.receiver_id)
        })

        if (userIds.size === 0) {
            setLoading(false)
            return []
        }

        // 3. Fetch details for these users
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', Array.from(userIds))

        // 4. Combine with latest message
        const conversationList = profiles?.map(profile => {
            const lastMsg = messages.find(m =>
                (m.sender_id === profile.id && m.receiver_id === user.id) ||
                (m.sender_id === user.id && m.receiver_id === profile.id)
            )
            return {
                ...profile,
                lastMessage: lastMsg?.content,
                lastMessageDate: lastMsg?.created_at
            }
        }).sort((a, b) => new Date(b.lastMessageDate) - new Date(a.lastMessageDate))

        setConversations(conversationList || [])
        setLoading(false)
        return conversationList || []
    }

    return (
        <div className="container mx-auto p-4 py-8 min-h-[80vh]">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
                <MessageSquare className="text-primary" /> Inbox
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
                {/* Conversation List */}
                <div className="card bg-base-100 border border-base-200 shadow-xl overflow-hidden h-full">
                    <div className="card-body p-0 overflow-y-auto">
                        {conversations.length === 0 ? (
                            <div className="p-8 text-center opacity-50">No conversations yet.</div>
                        ) : (
                            <ul className="menu w-full p-2">
                                {conversations.map(conv => (
                                    <li key={conv.id} onClick={() => setSelectedUser(conv)}>
                                        <div className={`flex gap-3 items-center p-3 rounded-lg ${selectedUser?.id === conv.id ? 'active' : ''}`}>
                                            <div className="avatar">
                                                <div className="w-10 rounded-full">
                                                    <img
                                                        src={conv.avatar_url || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}
                                                        alt={conv.full_name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <div className="font-bold truncate">{conv.full_name}</div>
                                                <div className="text-xs opacity-70 truncate">{conv.lastMessage}</div>
                                            </div>
                                            <div className="text-[10px] opacity-50 whitespace-nowrap">
                                                {new Date(conv.lastMessageDate).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Chat Window Container */}
                <div className="md:col-span-2 h-full">
                    {selectedUser ? (
                        <ChatWindow
                            recipientId={selectedUser.id}
                            recipientName={selectedUser.full_name}
                            recipientAvatar={selectedUser.avatar_url}
                        />
                    ) : (
                        <div className="h-full flex items-center justify-center border border-dashed border-base-300 rounded-xl bg-base-100/50">
                            <div className="text-center opacity-50">
                                <MessageSquare size={48} className="mx-auto mb-2 opacity-50" />
                                <p>Select a conversation to start chatting</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
