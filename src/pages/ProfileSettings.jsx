import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { Save, User, MapPin, AlignLeft } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function ProfileSettings() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        full_name: '',
        username: '',
        bio: '',
        location: '',
        website: '',
        role: 'customer',
        avatar_url: '',
        cover_photo_url: ''
    })

    useEffect(() => {
        if (user) fetchProfile()
    }, [user])

    const fetchProfile = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (data) {
            setFormData({
                full_name: data.full_name || '',
                username: data.username || '',
                bio: data.bio || '',
                location: data.location || '',
                website: data.website || '',
                role: data.role || 'customer',
                avatar_url: data.avatar_url || '',
                cover_photo_url: data.cover_photo_url || ''
            })
        }
        setLoading(false)
    }

    const handleImageUpload = async (e, field) => {
        const file = e.target.files[0]
        if (!file) return

        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${Math.random()}.${fileExt}`
        const bucket = field === 'avatar_url' ? 'avatars' : 'covers'

        try {
            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(fileName, file)

            if (uploadError) throw uploadError

            const { data } = supabase.storage
                .from(bucket)
                .getPublicUrl(fileName)

            setFormData(prev => ({ ...prev, [field]: data.publicUrl }))
            toast.success(`${field === 'avatar_url' ? 'Avatar' : 'Cover photo'} uploaded! Don't forget to save.`)
        } catch (error) {
            console.error('Upload error:', error)
            toast.error('Error uploading image. Make sure storage buckets exist.')
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)

        // Basic uniqueness check for username if changed could be added here, 
        // but Postgres constraint handles strict uniqueness.

        const { error } = await supabase
            .from('profiles')
            .update(formData)
            .eq('id', user.id)

        setSaving(false)
        if (!error) {
            toast.success('Profile updated successfully!')
        } else {
            console.error(error)
            toast.error(error.message || 'Error updating profile')
        }
    }

    if (loading) return (
        <div className="flex justify-center p-12">
            <span className="loading loading-spinner text-primary"></span>
        </div>
    )

    return (
        <div className="container mx-auto p-4 py-8 max-w-2xl">
            <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

            <div className="card bg-base-100 shadow border border-base-200">
                <div className="card-body">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Images Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-control">
                                <label className="label font-bold">Avatar</label>
                                <div className="flex items-center gap-4">
                                    <div className="avatar">
                                        <div className="w-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                            {formData.avatar_url ? (
                                                <img src={formData.avatar_url} alt="Avatar" />
                                            ) : (
                                                <div className="bg-neutral text-neutral-content w-full h-full flex items-center justify-center text-xl">
                                                    {formData.full_name?.[0]}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <input type="file" className="file-input file-input-bordered file-input-sm w-full max-w-xs" onChange={(e) => handleImageUpload(e, 'avatar_url')} accept="image/*" />
                                </div>
                            </div>

                            <div className="form-control">
                                <label className="label font-bold">Cover Photo</label>
                                <div className="flex flex-col gap-2">
                                    {formData.cover_photo_url && (
                                        <img src={formData.cover_photo_url} alt="Cover" className="w-full h-20 object-cover rounded-lg border border-base-300" />
                                    )}
                                    <input type="file" className="file-input file-input-bordered file-input-sm w-full" onChange={(e) => handleImageUpload(e, 'cover_photo_url')} accept="image/*" />
                                </div>
                            </div>
                        </div>

                        <div className="form-control">
                            <label className="label font-bold">Full Name</label>
                            <label className="input input-bordered flex items-center gap-2">
                                <User size={16} className="opacity-70" />
                                <input
                                    type="text"
                                    className="grow"
                                    value={formData.full_name}
                                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                />
                            </label>
                        </div>

                        <div className="form-control">
                            <label className="label font-bold">Username</label>
                            <label className="input input-bordered flex items-center gap-2">
                                <span className="opacity-70 font-mono text-xs">@</span>
                                <input
                                    type="text"
                                    className="grow"
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                                    pattern="^[a-z0-9_]+$"
                                    title="Lowercase letters, numbers, and underscores only."
                                />
                            </label>
                        </div>

                        <div className="form-control">
                            <label className="label font-bold">Location</label>
                            <label className="input input-bordered flex items-center gap-2">
                                <MapPin size={16} className="opacity-70" />
                                <input
                                    type="text"
                                    className="grow"
                                    placeholder="e.g. New York, NY"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                />
                            </label>
                        </div>

                        <div className="form-control">
                            <label className="label font-bold">Bio</label>
                            <textarea
                                className="textarea textarea-bordered h-24"
                                placeholder="Tell us about yourself..."
                                value={formData.bio}
                                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                            ></textarea>
                        </div>

                        <div className="form-control">
                            <label className="label font-bold">Website</label>
                            <input
                                type="url"
                                className="input input-bordered w-full"
                                placeholder="https://yourportfolio.com"
                                value={formData.website}
                                onChange={e => setFormData({ ...formData, website: e.target.value })}
                            />
                        </div>

                        {/* Optional: Role switching (use with caution in prod) */}
                        <div className="form-control bg-base-200 p-4 rounded-xl">
                            <label className="label cursor-pointer justify-start gap-4">
                                <span className="label-text font-bold">I am a Photographer</span>
                                <input
                                    type="checkbox"
                                    className="toggle toggle-primary"
                                    checked={formData.role === 'photographer'}
                                    onChange={e => setFormData({ ...formData, role: e.target.checked ? 'photographer' : 'customer' })}
                                />
                            </label>
                            <p className="text-xs opacity-70 mt-2">
                                Switch this on to enable photographer features like Dashboard and Portfolio capabilities.
                            </p>
                        </div>

                        <div className="card-actions justify-end mt-4">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? <span className="loading loading-spinner"></span> : <><Save size={18} /> Save Changes</>}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    )
}
