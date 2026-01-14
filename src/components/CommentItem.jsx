import { useState } from 'react'
import { Heart, MessageCircle, Send, CornerDownRight, MoreHorizontal, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'

export default function CommentItem({ comment, onReply, onDelete, onEdit, depth = 0 }) {
    const { user } = useAuth()
    const [liked, setLiked] = useState(false) // Note: Needs initial state if we fetch 'liked' status
    const [likesCount, setLikesCount] = useState(comment.likes_count || 0)
    const [showReplyInput, setShowReplyInput] = useState(false)
    const [replyContent, setReplyContent] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [replies, setReplies] = useState(comment.children || [])
    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState(comment.content)

    // Fetch initial like status - a bit expensive for every comment, maybe optimize later
    useState(() => {
        if (user) {
            supabase.from('comment_likes')
                .select('*')
                .match({ comment_id: comment.id, user_id: user.id })
                .single()
                .then(({ data }) => {
                    if (data) setLiked(true)
                })
        }
    }, [user, comment.id])

    const handleLike = async () => {
        if (!user) return toast.error('Please login to like')

        const newLiked = !liked
        setLiked(newLiked)
        setLikesCount(prev => newLiked ? prev + 1 : prev - 1)

        if (newLiked) {
            const { error } = await supabase.from('comment_likes').insert({ comment_id: comment.id, user_id: user.id })
            if (error) {
                setLiked(!newLiked)
                setLikesCount(prev => prev - 1)
            }
        } else {
            const { error } = await supabase.from('comment_likes').delete().match({ comment_id: comment.id, user_id: user.id })
            if (error) {
                setLiked(!newLiked)
                setLikesCount(prev => prev + 1)
            }
        }
    }

    const handleDelete = async () => {
        if (!confirm('Area you sure you want to delete this comment?')) return
        // Call parent handler
        if (onDelete) onDelete(comment.id) // Assuming passed as prop
    }

    const handleEdit = async (e) => {
        e.preventDefault()
        if (!editContent.trim()) return

        if (onEdit) {
            await onEdit(comment.id, editContent)
            setIsEditing(false)
        }
    }

    const handleReplyClick = () => {
        if (depth >= 2) {
            setReplyContent(`@${comment.profiles?.full_name} `)
        }
        setShowReplyInput(!showReplyInput)
    }

    const handleSubmitReply = async (e) => {
        e.preventDefault()
        if (!replyContent.trim()) return

        setSubmitting(true)
        try {
            // Logic for max depth:
            // If depth < 2: Normal reply (child). Parent = comment.id
            // If depth >= 2: Flattened reply (sibling). Parent = comment.parent_id
            const targetParentId = depth >= 2 ? comment.parent_id : comment.id

            await onReply(targetParentId, replyContent)

            setReplyContent('')
            setShowReplyInput(false)
        } catch (error) {
            console.error(error)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className={`mt-4 ${depth > 0 ? 'ml-8 border-l-2 border-base-200 pl-4' : ''}`}>
            <div className="flex gap-3 items-start group">
                <Link to={`/photographer/${comment.user_id}`} className="avatar placeholder pt-1 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                        {comment.profiles?.avatar_url ? (
                            <img src={comment.profiles.avatar_url} className="avatar-img" alt={comment.profiles.full_name} />
                        ) : (
                            <div className="avatar-placeholder-bg text-xs">
                                <span>{comment.profiles?.full_name?.[0]}</span>
                            </div>
                        )}
                    </div>
                </Link>

                <div className="flex-1">
                    {isEditing ? (
                        <form onSubmit={handleEdit} className="mb-2">
                            <input
                                className="input input-sm w-full rounded-2xl bg-base-200 focus:outline-none"
                                value={editContent}
                                onChange={e => setEditContent(e.target.value)}
                                autoFocus
                            />
                            <div className="flex gap-2 mt-2 text-xs">
                                <button type="submit" className="text-primary font-bold">Save</button>
                                <button type="button" onClick={() => setIsEditing(false)} className="opacity-50">Cancel</button>
                            </div>
                        </form>
                    ) : (
                        <div className="bg-base-200/50 rounded-2xl p-3 px-4 text-sm inline-block min-w-[200px]">
                            <Link to={`/photographer/${comment.user_id}`} className="font-bold block text-xs opacity-70 mb-1 hover:underline">
                                {comment.profiles?.full_name}
                            </Link>
                            <p className="whitespace-pre-wrap">{comment.content}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-1 ml-2 opacity-70 text-xs font-medium">
                        <span className="text-base-content/40">{new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <button
                            onClick={handleLike}
                            className={`hover:text-error transition-colors flex items-center gap-1 ${liked ? 'text-error' : ''}`}
                            title="Like"
                        >
                            <Heart size={14} fill={liked ? "currentColor" : "none"} />
                            {likesCount > 0 && <span>{likesCount}</span>}
                        </button>
                        <button
                            onClick={handleReplyClick}
                            className="hover:text-primary transition-colors flex items-center gap-1"
                            title="Reply"
                        >
                            <MessageCircle size={14} />
                        </button>

                        {/* Comment Options */}
                        <div className="dropdown dropdown-end dropdown-right">
                            <div tabIndex={0} role="button" className="hover:text-base-content transition-colors flex items-center" title="More">
                                <MoreHorizontal size={14} />
                            </div>
                            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32 border border-base-200">
                                {user && user.id === comment.user_id ? (
                                    <>
                                        <li><a onClick={() => setIsEditing(true)}>Edit</a></li>
                                        <li><a onClick={handleDelete} className="text-error">Delete</a></li>
                                    </>
                                ) : (
                                    <li><a onClick={() => toast.success("Comment Reported")}>Report</a></li>
                                )}
                            </ul>
                        </div>
                    </div>

                    {/* Reply Input */}
                    {showReplyInput && (
                        <form onSubmit={handleSubmitReply} className="flex gap-2 items-center mt-3 animate-fade-in">
                            <CornerDownRight size={16} className="text-base-content/30 ml-2" />
                            <input
                                type="text"
                                autoFocus
                                className="input input-sm input-bordered w-full rounded-full bg-base-100"
                                placeholder={depth >= 2 ? `Reply to thread...` : `Reply to ${comment.profiles?.full_name}...`}
                                value={replyContent}
                                onChange={e => setReplyContent(e.target.value)}
                            />
                            <button type="submit" className="btn btn-sm btn-circle btn-primary" disabled={submitting || !replyContent.trim()}>
                                <Send size={12} />
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {/* Render Children (Replies) */}
            {comment.children && comment.children.length > 0 && (
                <div className="mt-2">
                    {comment.children.map(child => (
                        <CommentItem
                            key={child.id}
                            comment={child}
                            onReply={onReply}
                            onDelete={onDelete}
                            onEdit={onEdit}
                            depth={depth + 1}
                            user={user}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
