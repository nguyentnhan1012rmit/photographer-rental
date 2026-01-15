import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Search, X, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'


export default function NewChatModal({ isOpen, onClose, onSelectUser }) {
    const { user } = useAuth()
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [following, setFollowing] = useState([])
    const [loading, setLoading] = useState(false)
    const [searchLoading, setSearchLoading] = useState(false)

    const fetchFollowing = useCallback(async () => {
        setLoading(true)
        // Get IDs of people the user follows
        const { data: followsData } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', user.id)

        if (followsData && followsData.length > 0) {
            const ids = followsData.map(f => f.following_id)
            const { data: profiles } = await supabase
                .from('profiles')
                .select('*')
                .in('id', ids)
            setFollowing(profiles || [])
        } else {
            setFollowing([])
        }
        setLoading(false)
    }, [user])

    useEffect(() => {
        if (isOpen && user) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchFollowing()
        }
    }, [isOpen, user, fetchFollowing])

    const searchUsers = useCallback(async () => {
        setSearchLoading(true)
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .ilike('username', `%${searchQuery}%`)
            .neq('id', user.id) // Don't show self
            .limit(5)

        setSearchResults(data || [])
        setSearchLoading(false)
    }, [searchQuery, user])

    useEffect(() => {
        if (searchQuery.trim().length > 2) {
            const delayDebounceFn = setTimeout(() => {
                searchUsers()
            }, 500)
            return () => clearTimeout(delayDebounceFn)
        } else {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSearchResults([])
        }
    }, [searchQuery, searchUsers])

    const handleSelect = (selectedUser) => {
        onSelectUser(selectedUser)
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="modal-box w-full max-w-lg h-[600px] flex flex-col p-0 overflow-hidden bg-base-100">
                {/* Header */}
                <div className="p-4 border-b border-base-200 flex items-center justify-between">
                    <h3 className="font-bold text-lg">New Message</h3>
                    <button onClick={onClose} className="btn btn-sm btn-ghost btn-circle">
                        <X size={20} />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-base-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" size={18} />
                        <input
                            type="text"
                            className="input input-bordered w-full pl-10"
                            placeholder="Search by username..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {searchQuery.trim().length > 0 ? (
                        // Search Results
                        <div>
                            <h4 className="text-sm font-bold opacity-50 mb-2 uppercase tracking-wide">Search Results</h4>
                            {searchLoading ? (
                                <div className="py-4 text-center opacity-50">Searching...</div>
                            ) : searchResults.length === 0 ? (
                                <div className="py-4 text-center opacity-50">No users found.</div>
                            ) : (
                                <div className="space-y-1">
                                    {searchResults.map(profile => (
                                        <UserItem key={profile.id} profile={profile} onClick={() => handleSelect(profile)} />
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        // Following List
                        <div>
                            <h4 className="text-sm font-bold opacity-50 mb-2 uppercase tracking-wide">Following</h4>
                            {loading ? (
                                <div className="py-4 text-center opacity-50">Loading...</div>
                            ) : following.length === 0 ? (
                                <div className="py-8 text-center opacity-50 flex flex-col items-center">
                                    <User size={48} className="mb-2 opacity-20" />
                                    <p>You aren't following anyone yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {following.map(profile => (
                                        <UserItem key={profile.id} profile={profile} onClick={() => handleSelect(profile)} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function UserItem({ profile, onClick }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-3 w-full p-3 hover:bg-base-200 rounded-lg text-left transition-colors"
        >
            <div className="avatar">
                <div className="w-10 rounded-full">
                    <img src={profile.avatar_url || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"} alt={profile.full_name} />
                </div>
            </div>
            <div>
                <p className="font-bold">{profile.full_name}</p>
                <p className="text-xs opacity-50">@{profile.username || 'user'}</p>
            </div>
        </button>
    )
}
