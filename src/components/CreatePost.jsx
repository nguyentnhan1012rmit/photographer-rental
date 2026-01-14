import { useState, useRef } from 'react'
import { Image, Send, X } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'

export default function CreatePost({ onPostCreated }) {
    const { user } = useAuth()
    const [content, setContent] = useState('')
    const [image, setImage] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(null)
    const [loading, setLoading] = useState(false)
    const fileInputRef = useRef(null)

    const handleImageSelect = (e) => {
        const file = e.target.files[0]
        if (file) {
            setImage(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const removeImage = () => {
        setImage(null)
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!content.trim() && !image) return

        setLoading(true)

        // Todo: Real image upload to Supabase Storage would go here.
        // For now, we'll just post the text content.
        let uploadedImageUrl = null

        /* 
        // Example Upload Logic:
        if (image) {
            const fileExt = image.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const { error: uploadError } = await supabase.storage.from('posts').upload(fileName, image)
            if (!uploadError) {
                const { data } = supabase.storage.from('posts').getPublicUrl(fileName)
                uploadedImageUrl = data.publicUrl
            }
        }
        */

        const { error } = await supabase.from('posts').insert({
            content,
            user_id: user.id,
            image_url: uploadedImageUrl // null for now unless storage is set up
        })

        setLoading(false)
        if (!error) {
            setContent('')
            removeImage()
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

                    {previewUrl && (
                        <div className="relative mt-2 mb-4 group">
                            <img src={previewUrl} alt="Preview" className="rounded-xl w-full max-h-[400px] object-cover border border-base-content/10" />
                            <button
                                type="button"
                                onClick={removeImage}
                                className="absolute top-2 right-2 btn btn-circle btn-sm btn-neutral opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    <div className="flex justify-between items-center mt-4 px-2">
                        <div className="flex gap-2 text-primary">
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageSelect}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="btn btn-ghost btn-circle btn-sm hover:bg-primary/20"
                                title="Add Image"
                            >
                                <Image size={20} />
                            </button>
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary rounded-full px-6"
                            disabled={loading || (!content.trim() && !image)}
                        >
                            {loading ? <span className="loading loading-spinner"></span> : <span className="flex items-center gap-2">Post <Send size={16} /></span>}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}
