import { useState } from 'react'
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'

export default function PostCard({ post }) {
    const { user } = useAuth()
    const [liked, setLiked] = useState(false) // meaningful state would require fetching 'did I like this'
    const [likesCount, setLikesCount] = useState(post.likes_count || 0)

    const handleLike = async () => {
        if (!user) return alert('Please login to like')

        // Optimistic update
        const newLiked = !liked
        setLiked(newLiked)
        setLikesCount(prev => newLiked ? prev + 1 : prev - 1)

        if (newLiked) {
            const { error } = await supabase.from('likes').insert({ post_id: post.id, user_id: user.id })
            if (error) {
                // Revert if failed
                setLiked(!newLiked)
                setLikesCount(prev => prev - 1)
            }
        } else {
            const { error } = await supabase.from('likes').delete().match({ post_id: post.id, user_id: user.id })
            if (error) {
                // Revert if failed
                setLiked(!newLiked)
                setLikesCount(prev => prev + 1)
            }
        }
    }

    return (
        <div className="py-6 border-b border-base-200/50 first:pt-0 last:border-0 hover:bg-base-100/40 transition-colors -mx-4 px-4">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <div className="avatar placeholder">
                    <div className="bg-primary/20 text-primary rounded-full w-12 text-lg font-bold">
                        <span>{post.profiles?.full_name?.charAt(0) || 'U'}</span>
                    </div>
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-base text-base-content">{post.profiles?.full_name || 'Unknown User'}</h3>
                    <div className="text-sm text-base-content/50">
                        {new Date(post.created_at).toLocaleDateString()}
                    </div>
                </div>
                <button className="btn btn-ghost btn-xs btn-circle opacity-50">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            {/* Content */}
            <div className="pl-[64px]">
                <p className="text-lg mb-4 whitespace-pre-wrap leading-relaxed text-base-content/90">{post.content}</p>

                {post.image_url && (
                    <figure className="mb-4 rounded-xl overflow-hidden border border-base-200/20">
                        <img src={post.image_url} alt="Post content" className="w-full object-cover max-h-[500px]" />
                    </figure>
                )}

                {/* Actions */}
                <div className="flex items-center gap-6 pt-2">
                    <button
                        onClick={handleLike}
                        className={`btn btn-ghost btn-sm gap-2 px-0 hover:bg-transparent ${liked ? 'text-red-500' : 'text-base-content/60'}`}
                    >
                        <Heart size={20} fill={liked ? "currentColor" : "none"} />
                        <span className="text-sm font-medium">{likesCount > 0 ? likesCount : ''}</span>
                    </button>
                    <button className="btn btn-ghost btn-sm gap-2 px-0 hover:bg-transparent text-base-content/60">
                        <MessageCircle size={20} />
                        <span className="text-sm font-medium">{post.comments_count > 0 ? post.comments_count : ''}</span>
                    </button>
                    <button className="btn btn-ghost btn-sm gap-2 px-0 ml-auto hover:bg-transparent text-base-content/60">
                        <Share2 size={20} />
                    </button>
                </div>
            </div>
        </div>
    )
}
