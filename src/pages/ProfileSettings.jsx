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
        bio: '',
        location: '',
        role: 'customer'
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
                bio: data.bio || '',
                location: data.location || '',
                role: data.role || 'customer'
            })
        }
        setLoading(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)

        const { error } = await supabase
            .from('profiles')
            .update(formData)
            .eq('id', user.id)

        setSaving(false)
        if (!error) {
            toast.success('Profile updated successfully!')
        } else {
            toast.error('Error updating profile')
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
