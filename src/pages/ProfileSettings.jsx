import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { Save, User, MapPin, Camera, X, ZoomIn, Image, Check } from 'lucide-react'
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

    // Image Upload & Crop State
    const avatarInputRef = useRef(null)
    const coverInputRef = useRef(null)
    const [cropModalOpen, setCropModalOpen] = useState(false)
    const [imageToCrop, setImageToCrop] = useState(null)
    const [cropScale, setCropScale] = useState(1)
    const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
    const imageRef = useRef(null) // Ref for the image element in cropper

    const fetchProfile = useCallback(async () => {
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
    }, [user])

    useEffect(() => {
        if (user) fetchProfile()
    }, [user, fetchProfile])


    // --- File Selection ---
    const handleFileSelect = (e, type) => {
        const file = e.target.files[0]
        if (!file) return

        if (type === 'avatar') {
            // Open Cropper for Avatar
            const reader = new FileReader()
            reader.onload = () => {
                setImageToCrop(reader.result)
                setCropScale(1)
                setCropPosition({ x: 0, y: 0 })
                setCropModalOpen(true)
            }
            reader.readAsDataURL(file)
        } else {
            // Direct upload for Cover
            handleImageUpload(file, 'cover_photo_url')
        }
    }

    // --- Upload Logic ---
    const handleImageUpload = async (file, field) => {
        if (!file) return

        // const fileExt = file.name.split('.').pop() // Don't rely on existing name for blobs
        const fileExt = field === 'avatar_url' ? 'png' : file.name?.split('.').pop() || 'jpg'
        const fileName = `${user.id}/${Date.now()}.${fileExt}`
        const bucket = field === 'avatar_url' ? 'avatars' : 'covers'

        const loadingToast = toast.loading("Uploading...")

        try {
            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(fileName, file, { upsert: true })

            if (uploadError) throw uploadError

            const { data } = supabase.storage
                .from(bucket)
                .getPublicUrl(fileName)

            // Append timestamp to bust cache if replacing same file
            const publicUrl = `${data.publicUrl}?t=${Date.now()}`

            setFormData(prev => ({ ...prev, [field]: publicUrl }))
            toast.dismiss(loadingToast)
            toast.success(`${field === 'avatar_url' ? 'Avatar' : 'Cover photo'} updated!`)
        } catch (error) {
            console.error('Upload error:', error)
            toast.dismiss(loadingToast)
            toast.error('Error uploading image.')
        }
    }

    // --- Crop Logic ---
    const onMouseDown = (e) => {
        setIsDragging(true)
        setDragStart({ x: e.clientX - cropPosition.x, y: e.clientY - cropPosition.y })
    }

    const onMouseMove = (e) => {
        if (isDragging) {
            setCropPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            })
        }
    }

    const onMouseUp = () => {
        setIsDragging(false)
    }

    const handleSaveCrop = async () => {
        if (!imageRef.current) return

        // Canvas output size
        const size = 300
        const viewerSize = 256 // w-64 is 256px
        const ratio = size / viewerSize

        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')

        // Fill background
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, size, size)

        const img = imageRef.current
        const naturalWidth = img.naturalWidth
        const naturalHeight = img.naturalHeight

        // Math:
        // 1. Move to Center of Canvas
        ctx.translate(size / 2, size / 2)

        // 2. Apply User Pan (adjusted for scale ratio between viewer and canvas)
        ctx.translate(cropPosition.x * ratio, cropPosition.y * ratio)

        // 3. Apply User Zoom
        ctx.scale(cropScale, cropScale)

        // 4. Apply Base Scale
        // In the viewer, the image is rendered with "max-width: none" which implies natural size, 
        // BUT we need to map the "viewer pixels" to "canvas pixels".
        // If 1px on screen = 1px in natural image (roughly), then we just scale by ratio.
        const effectiveScale = ratio
        ctx.scale(effectiveScale, effectiveScale)

        ctx.translate(-naturalWidth / 2, -naturalHeight / 2)
        ctx.drawImage(img, 0, 0)

        canvas.toBlob((blob) => {
            handleImageUpload(blob, 'avatar_url')
            setCropModalOpen(false)
            setImageToCrop(null)
        }, 'image/png')
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
                        <div className="space-y-6">
                            {/* Cover Photo - Full Width */}
                            <div className="relative group w-full h-48 rounded-2xl overflow-hidden bg-base-200 border border-base-300">
                                {formData.cover_photo_url ? (
                                    <img src={formData.cover_photo_url} alt="Cover" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full opacity-30">
                                        <Image size={48} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                    onClick={() => coverInputRef.current.click()}>
                                    <div className="btn btn-sm btn-glass text-white gap-2">
                                        <Camera size={16} /> Change Cover
                                    </div>
                                </div>
                                <input
                                    ref={coverInputRef}
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => handleFileSelect(e, 'cover')}
                                    accept="image/*"
                                />
                            </div>

                            {/* Avatar - Negative Margin Overlay */}
                            <div className="relative -mt-16 mx-auto w-32 h-32">
                                <div
                                    className="relative w-full h-full rounded-full ring-4 ring-base-100 shadow-xl overflow-hidden group cursor-pointer bg-base-100"
                                    onClick={() => avatarInputRef.current.click()}
                                >
                                    {formData.avatar_url ? (
                                        <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-neutral text-neutral-content flex items-center justify-center text-3xl font-bold">
                                            {formData.full_name?.[0]}
                                        </div>
                                    )}

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Camera className="text-white" size={24} />
                                    </div>
                                </div>
                                <input
                                    ref={avatarInputRef}
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => handleFileSelect(e, 'avatar')}
                                    accept="image/*"
                                />
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

                        {/* Optional: Role switching */}
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

            {/* Custom Crop Modal */}
            {cropModalOpen && imageToCrop && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-base-100 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-appear">
                        <div className="p-4 border-b border-base-200 flex justify-between items-center">
                            <h3 className="font-bold text-lg">Edit Avatar</h3>
                            <button onClick={() => setCropModalOpen(false)} className="btn btn-ghost btn-circle btn-sm">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 flex flex-col items-center gap-6">
                            {/* Mask & Image Container */}
                            <div className="relative w-64 h-64 rounded-full border-4 border-primary/20 overflow-hidden cursor-move touch-none bg-base-300"
                                onMouseDown={onMouseDown}
                                onMouseMove={onMouseMove}
                                onMouseUp={onMouseUp}
                                onMouseLeave={onMouseUp}
                            >
                                <img
                                    ref={imageRef}
                                    src={imageToCrop}
                                    alt="Crop Preview"
                                    draggable={false}
                                    style={{
                                        transform: `translate(${cropPosition.x}px, ${cropPosition.y}px) scale(${cropScale})`,
                                        transformOrigin: 'center',
                                        maxWidth: 'none',
                                        maxHeight: 'none',
                                        // Initialize roughly centered? We rely on flex center of parent if we weren't absolute
                                        // But here we translate from 0,0. 
                                        // Let's use flex center on the parent div to center the <img> initially
                                        position: 'absolute',
                                        left: '50%',
                                        top: '50%',
                                        marginLeft: '-50%', // These negative margins with left/top 50% center the image anchor
                                        marginTop: '-50%',
                                        pointerEvents: 'none' // Let events pass to container
                                    }}
                                    className="transition-transform duration-75 ease-out"
                                />
                            </div>

                            <p className="text-xs opacity-50 flex items-center gap-1">
                                <Move size={14} /> Drag to position
                            </p>

                            {/* Zoom Control */}
                            <div className="w-full flex items-center gap-4 px-4">
                                <span className="text-xs font-bold">Zoom</span>
                                <input
                                    type="range"
                                    min="1"
                                    max="3"
                                    step="0.1"
                                    value={cropScale}
                                    onChange={(e) => setCropScale(parseFloat(e.target.value))}
                                    className="range range-primary range-xs"
                                />
                                <ZoomIn size={16} className="opacity-50" />
                            </div>

                            <div className="flex gap-2 w-full">
                                <button className="btn btn-ghost flex-1" onClick={() => setCropModalOpen(false)}>Cancel</button>
                                <button className="btn btn-primary flex-1" onClick={handleSaveCrop}>
                                    Apply <Check size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
