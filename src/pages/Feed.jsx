import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import PostCard from '../components/PostCard'
import CreatePost from '../components/CreatePost'

export default function Feed() {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchPosts = useCallback(async () => {
        setLoading(true)
        // 1. Fetch posts without the failed join
        const { data: postsData, error: postsError } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20)

        if (postsError) {
            console.error('Error fetching posts:', postsError)
            setLoading(false)
            return
        }

        if (postsData && postsData.length > 0) {
            // 2. Extract user IDs from posts
            const userIds = [...new Set(postsData.map(p => p.user_id))]

            // 3. Fetch profiles for those users
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url')
                .in('id', userIds)

            if (profilesError) {
                console.error('Error fetching profiles:', profilesError)
            }

            // 4. Map profiles to posts manually
            const profilesMap = (profilesData || []).reduce((acc, profile) => {
                acc[profile.id] = profile
                return acc
            }, {})

            const postsWithProfiles = postsData.map(post => ({
                ...post,
                profiles: profilesMap[post.user_id] || null // Attach profile manually
            }))

            setPosts(postsWithProfiles)
        } else {
            setPosts([])
        }
        setLoading(false)
    }, [])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchPosts()
    }, [fetchPosts])

    return (
        <div className="min-h-screen bg-base-100 py-12">
            <div className="w-full max-w-3xl mx-auto px-6">
                <div className="flex items-center justify-between mb-12 border-b border-base-content/10 pb-6">
                    <h1 className="text-4xl font-bold tracking-tight">Community Feed</h1>
                </div>

                <CreatePost onPostCreated={fetchPosts} />

                {loading ? (
                    <div className="flex justify-center p-12">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                    </div>
                ) : (
                    <div className="space-y-0">
                        {posts.map(post => (
                            <PostCard key={post.id} post={post} onDelete={fetchPosts} />
                        ))}
                        {posts.length === 0 && (
                            <div className="text-center py-20 opacity-50 border-t border-base-content/10">
                                <p className="text-xl font-light">No posts yet.</p>
                                <p className="text-sm mt-2">Be the first to share something!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
