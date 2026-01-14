import { useState } from 'react'
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2, Send, Edit2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import CommentItem from './CommentItem'
import { Link } from 'react-router-dom'

export default function PostCard({ post, onDelete }) {
    const { user } = useAuth()
    const [liked, setLiked] = useState(false)
    const [likesCount, setLikesCount] = useState(post.likes_count || 0)
    const [comments, setComments] = useState([])
    const [showComments, setShowComments] = useState(false)
    const [newComment, setNewComment] = useState('')
    const [loadingComments, setLoadingComments] = useState(false)

    // Check if user liked this post
    useState(() => {
        if (user) {
            supabase.from('likes')
                .select('*')
                .match({ post_id: post.id, user_id: user.id })
                .single()
                .then(({ data }) => {
                    if (data) setLiked(true)
                })
        }
    }, [user, post.id])

    const handleLike = async () => {
        if (!user) return toast.error('Please login to like')

        const newLiked = !liked
        setLiked(newLiked)
        setLikesCount(prev => newLiked ? prev + 1 : prev - 1)

        if (newLiked) {
            const { error } = await supabase.from('likes').insert({ post_id: post.id, user_id: user.id })
            if (error) {
                setLiked(!newLiked)
                setLikesCount(prev => prev - 1)
            }
        } else {
            const { error } = await supabase.from('likes').delete().match({ post_id: post.id, user_id: user.id })
            if (error) {
                setLiked(!newLiked)
                setLikesCount(prev => prev + 1)
            }
        }
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this post?')) return
        const { error } = await supabase.from('posts').delete().eq('id', post.id)
        if (error) {
            toast.error('Failed to delete post')
        } else {
            toast.success('Post deleted')
            if (onDelete) onDelete(post.id)
        }
    }

    const buildCommentTree = (flatComments) => {
        const commentMap = {}
        const roots = []

        // First pass: create map
        flatComments.forEach(c => {
            commentMap[c.id] = { ...c, children: [] }
        })

        // Second pass: link children to parents
        flatComments.forEach(c => {
            if (c.parent_id) {
                if (commentMap[c.parent_id]) {
                    commentMap[c.parent_id].children.push(commentMap[c.id])
                }
            } else {
                roots.push(commentMap[c.id])
            }
        })
        return roots
    }

    const toggleComments = async () => {
        if (!showComments) {
            setLoadingComments(true)
            setShowComments(true)
            await fetchComments()
            setLoadingComments(false)
        } else {
            setShowComments(false)
        }
    }

    const fetchComments = async () => {
        const { data } = await supabase
            .from('comments')
            .select('*, profiles(full_name, avatar_url)')
            .eq('post_id', post.id)
            .order('created_at', { ascending: true })
        setComments(buildCommentTree(data || []))
    }

    const handleAddComment = async (e) => {
        e.preventDefault()
        if (!newComment.trim()) return
        await handleReply(null, newComment)
        setNewComment('')
    }

    const handleReply = async (parentId, content) => {
        if (!user) {
            toast.error('Please login to reply')
            return
        }

        const { error } = await supabase
            .from('comments')
            .insert({
                post_id: post.id,
                user_id: user.id,
                parent_id: parentId,
                content: content
            })

        if (error) {
            toast.error('Failed to comment')
        } else {
            // Refresh comments
            await fetchComments()
            if (!parentId) {
                // Optimistically update main count if root comment? 
                // DB trigger handles real count, but we might want local feedback.
                // For nested replies, they don't change the Post's total comment count usually? 
                // Ah, our earlier sql trigger updates post comment count on ANY insert to comments table.
                // So yes, we could increment locally.
            }
        }
    }

    const handleDeleteComment = async (commentId) => {
        const { error } = await supabase.from('comments').delete().eq('id', commentId)
        if (error) {
            toast.error('Failed to delete comment')
        } else {
            await fetchComments()
            toast.success('Comment deleted')
        }
    }

    const handleEditComment = async (commentId, content) => {
        const { error } = await supabase.from('comments').update({ content }).eq('id', commentId)
        if (error) {
            toast.error('Failed to update comment')
        } else {
            await fetchComments()
            toast.success('Comment updated')
        }
    }

    return (
        <div className="py-6 border-b border-base-200/50 first:pt-0 last:border-0 hover:bg-base-100/40 transition-colors -mx-4 px-4">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <Link to={`/photographer/${post.user_id}`} className="avatar placeholder hover:opacity-80 transition-opacity">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                        {post.profiles?.avatar_url ? (
                            <img src={post.profiles.avatar_url} className="avatar-img" alt={post.profiles.full_name} />
                        ) : (
                            <div className="avatar-placeholder-bg text-lg">
                                <span>{post.profiles?.full_name?.charAt(0) || 'U'}</span>
                            </div>
                        )}
                    </div>
                </Link>
                <div className="flex-1">
                    <Link to={`/photographer/${post.user_id}`} className="font-bold text-base text-base-content hover:underline">
                        {post.profiles?.full_name || 'Unknown User'}
                    </Link>
                    <div className="text-sm text-base-content/50">
                        {new Date(post.created_at).toLocaleDateString()}
                    </div>
                </div>

                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-xs btn-circle opacity-50">
                        <MoreHorizontal size={20} />
                    </div>
                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                        {user && user.id === post.user_id ? (
                            <>
                                <li>
                                    <a onClick={() => toast("Edit feature coming soon!")}>
                                        <Edit2 size={16} /> Edit Post
                                    </a>
                                </li>
                                <li>
                                    <a onClick={handleDelete} className="text-error">
                                        <Trash2 size={16} /> Delete Post
                                    </a>
                                </li>
                            </>
                        ) : (
                            <li><a onClick={() => toast.success("Post Reported")}>Report Post</a></li>
                        )}
                    </ul>
                </div>
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
                    <button
                        onClick={toggleComments}
                        className="btn btn-ghost btn-sm gap-2 px-0 hover:bg-transparent text-base-content/60"
                    >
                        <MessageCircle size={20} />
                        <span className="text-sm font-medium">{post.comments_count > 0 ? post.comments_count : ''}</span>
                    </button>
                    <button
                        onClick={() => toast('Share feature under development 🛠️', { icon: '🚧' })}
                        className="btn btn-ghost btn-sm gap-2 px-0 ml-auto hover:bg-transparent text-base-content/60"
                    >
                        <Share2 size={20} />
                    </button>
                </div>

                {/* Comments Section */}
                {showComments && (
                    <div className="mt-6 pt-6 border-t border-base-200">
                        {/* List */}
                        <div className="space-y-4 mb-4">
                            {loadingComments ? (
                                <div className="text-center opacity-50 py-2">Loading comments...</div>
                            ) : comments.length > 0 ? (
                                comments.map(comment => (
                                    <CommentItem
                                        key={comment.id}
                                        comment={comment}
                                        onReply={handleReply}
                                        onDelete={handleDeleteComment}
                                        onEdit={handleEditComment}
                                    />
                                ))
                            ) : (
                                <div className="text-sm opacity-50 italic">No comments yet.</div>
                            )}
                        </div>

                        {/* Input */}
                        <form onSubmit={handleAddComment} className="flex gap-2 items-center">
                            <input
                                type="text"
                                className="input input-bordered input-sm w-full rounded-full"
                                placeholder="Write a comment..."
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                            />
                            <button type="submit" className="btn btn-sm btn-circle btn-primary" disabled={!newComment.trim()}>
                                <Send size={14} />
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    )
}
