import { useState } from 'react'
import { Image, Send, Paperclip } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'

export default function CreatePost({ onPostCreated }) {
    const { user } = useAuth()
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!content.trim()) return

        setLoading(true)
        const { error } = await supabase.from('posts').insert({
            content,
            user_id: user.id
        })

        setLoading(false)
        if (!error) {
            setContent('')
            if (onPostCreated) onPostCreated()
        }
    }

    if (!user) return null

    return (
        <div className="mb-12 pb-8 border-b border-base-content/10">
            <form onSubmit={handleSubmit} className="flex gap-4 items-start">
                <div className="avatar placeholder pt-2">
                    <div className="bg-primary/20 text-primary rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold">
                        <span>{user.email?.charAt(0).toUpperCase()}</span>
                    </div>
                </div>

                <div className="flex-1">
                    <textarea
                        className="textarea textarea-ghost w-full focus:outline-none focus:bg-base-200/30 text-lg px-4 py-3 min-h-[120px] resize-none placeholder:text-base-content/30"
                        placeholder="What's happening?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    ></textarea>

                    <div className="flex justify-between items-center mt-4 px-2">
                        <div className="flex gap-2 text-primary">
                            <button type="button" className="btn btn-ghost btn-circle btn-sm hover:bg-primary/20">
                                <Image size={20} />
                            </button>
                            <button type="button" className="btn btn-ghost btn-circle btn-sm hover:bg-primary/20">
                                <Paperclip size={20} />
                            </button>
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary rounded-full px-6"
                            disabled={loading || !content.trim()}
                        >
                            {loading ? <span className="loading loading-spinner"></span> : <span className="flex items-center gap-2">Post <Send size={16} /></span>}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}
