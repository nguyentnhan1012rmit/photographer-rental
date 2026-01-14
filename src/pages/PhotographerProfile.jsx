import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { MapPin, Mail, Camera, Star, ArrowLeft, Heart, MessageCircle, Plus, X, Image as ImageIcon } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import BookingModal from '../components/BookingModal'
import ReviewSection from '../components/ReviewSection'
import { toast } from 'react-hot-toast'

export default function PhotographerProfile() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const [profile, setProfile] = useState(null)
    const [services, setServices] = useState([])
    const [portfolio, setPortfolio] = useState([])
    const [averageRating, setAverageRating] = useState(0)
    const [reviewCount, setReviewCount] = useState(0)
    const [loading, setLoading] = useState(true)

    const isOwner = user && user.id === id

    // Booking State
    const [selectedService, setSelectedService] = useState(null)
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

    // Owner Feature States
    const [isAddPortfolioOpen, setIsAddPortfolioOpen] = useState(false)
    const [isAddServiceOpen, setIsAddServiceOpen] = useState(false)

    // Forms
    const [newService, setNewService] = useState({ title: '', description: '', price: '' })
    const [newPortfolioImage, setNewPortfolioImage] = useState(null)
    const [newPortfolioCaption, setNewPortfolioCaption] = useState('')
    const [portfolioPreview, setPortfolioPreview] = useState(null)

    useEffect(() => {
        async function fetchData() {
            setLoading(true)

            // Fetch Profile
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', id)
                .single()

            setProfile(profileData)

            if (profileData) {
                // Fetch Services
                const { data: servicesData } = await supabase
                    .from('services')
                    .select('*')
                    .eq('photographer_id', id)
                setServices(servicesData || [])

                // Fetch Portfolio
                const { data: portfolioData } = await supabase
                    .from('portfolio_items')
                    .select('*')
                    .eq('photographer_id', id)
                    .order('created_at', { ascending: false })
                setPortfolio(portfolioData || [])

                // Fetch Reviews for Rating
                const { data: reviewsData } = await supabase
                    .from('reviews')
                    .select('rating')
                    .eq('photographer_id', id)

                if (reviewsData && reviewsData.length > 0) {
                    const avg = reviewsData.reduce((acc, curr) => acc + curr.rating, 0) / reviewsData.length
                    setAverageRating(avg.toFixed(1))
                    setReviewCount(reviewsData.length)
                }
            }

            setLoading(false)
        }
        fetchData()
    }, [id])

    const handleBookClick = (service) => {
        if (!user) {
            navigate('/login')
            return
        }
        setSelectedService(service)
        setIsBookingModalOpen(true)
    }

    const scrollToServices = () => {
        const element = document.getElementById('services-section');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Owner Handlers
    const handleAddService = async (e) => {
        e.preventDefault()
        const { error } = await supabase.from('services').insert({
            photographer_id: user.id,
            title: newService.title,
            description: newService.description,
            price: parseFloat(newService.price)
        })

        if (!error) {
            toast.success("Service added!")
            setIsAddServiceOpen(false)
            setNewService({ title: '', description: '', price: '' })
            // Refresh logic
            const { data } = await supabase.from('services').select('*').eq('photographer_id', id)
            setServices(data || [])
        } else {
            toast.error("Failed to add service")
        }
    }

    const handlePortfolioImageSelect = (e) => {
        const file = e.target.files[0]
        if (file) {
            setNewPortfolioImage(file)
            setPortfolioPreview(URL.createObjectURL(file))
        }
    }

    const handleAddPortfolio = async (e) => {
        e.preventDefault()
        if (!newPortfolioImage) return

        let imageUrl = null
        const fileExt = newPortfolioImage.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${user.id}/${fileName}`

        try {
            // Attempt upload
            const { error: uploadError } = await supabase.storage
                .from('portfolio')
                .upload(filePath, newPortfolioImage)

            if (uploadError) throw uploadError

            const { data: publicUrlData } = supabase.storage
                .from('portfolio')
                .getPublicUrl(filePath)

            imageUrl = publicUrlData.publicUrl
        } catch (err) {
            console.error("Upload failed", err)
            // Fallback: If bucket is missing or RLS blocks, we might fail.
            // For now, let's just alert the user.
            toast.error("Upload failed (Storage bucket 'portfolio' likely missing).")
            return
        }

        const { error } = await supabase.from('portfolio_items').insert({
            photographer_id: user.id,
            image_url: imageUrl,
            caption: newPortfolioCaption
        })

        if (!error) {
            toast.success("Added to portfolio!")
            setIsAddPortfolioOpen(false)
            setNewPortfolioImage(null)
            setPortfolioPreview(null)
            setNewPortfolioCaption('')
            // Refresh
            const { data } = await supabase.from('portfolio_items').select('*').eq('photographer_id', id).order('created_at', { ascending: false })
            setPortfolio(data || [])
        } else {
            toast.error("Failed to save portfolio item")
        }
    }


    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
    )

    if (!profile) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <h2 className="text-2xl font-bold">Photographer not found</h2>
            <button onClick={() => navigate('/photographers')} className="btn btn-outline">
                <ArrowLeft size={18} /> Back to List
            </button>
        </div>
    )

    return (
        <div className="min-h-screen bg-base-100 pb-20">
            {/* Navigation Back Button */}
            <div className="p-4">
                <button
                    onClick={() => navigate('/photographers')}
                    className="btn btn-ghost btn-circle"
                >
                    <ArrowLeft size={24} />
                </button>
            </div>

            <div className="container mx-auto px-4 max-w-4xl">
                {/* New Profile Header Layout */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-12 mb-12">

                    {/* Avatar */}
                    <div className="avatar">
                        <div className="w-24 md:w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt={profile.full_name} />
                            ) : (
                                <div className="bg-neutral text-neutral-content w-full h-full flex items-center justify-center text-4xl font-bold">
                                    {profile.full_name?.[0]}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="flex-1 flex flex-col items-center md:items-start gap-4">
                        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 w-full">
                            <h1 className="text-3xl font-bold">{profile.full_name}</h1>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                <button className="btn btn-primary btn-sm rounded-full px-6" onClick={scrollToServices}>
                                    Booking
                                </button>
                                <button
                                    className="btn btn-outline btn-circle btn-sm"
                                    onClick={() => navigate('/inbox', { state: { startChatWith: profile } })}
                                >
                                    <Mail size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="flex items-center gap-8 text-sm md:text-base">
                            <div className="text-center md:text-left">
                                <span className="font-bold block text-lg">{portfolio.length}</span>
                                <span className="opacity-70">posts</span>
                            </div>
                            <div className="text-center md:text-left">
                                <span className="font-bold block text-lg">1.2k</span>
                                <span className="opacity-70">followers</span>
                            </div>
                            <div className="text-center md:text-left">
                                <div className="flex items-center gap-1 justify-center md:justify-start">
                                    <span className="font-bold text-lg">{averageRating}</span>
                                    <Star size={16} className="fill-warning text-warning" />
                                </div>
                                <span className="opacity-70">rating</span>
                            </div>
                        </div>

                        {/* Bio & Location */}
                        <div className="text-center md:text-left space-y-1 max-w-md">
                            {profile.location && (
                                <div className="flex items-center justify-center md:justify-start gap-1 text-sm opacity-70">
                                    <MapPin size={14} /> {profile.location}
                                </div>
                            )}
                            <p className="text-sm opacity-90 leading-relaxed">
                                {profile.bio || "Capturing moments, creating memories. Professional photographer available for bookings."}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="divider"></div>

                {/* Portfolio Grid */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <ImageIcon size={24} />
                            Portfolio
                        </h3>
                        {isOwner && (
                            <button onClick={() => setIsAddPortfolioOpen(true)} className="btn btn-sm btn-outline gap-2">
                                <Plus size={16} /> Add Photo
                            </button>
                        )}
                    </div>

                    {portfolio.length === 0 ? (
                        <div className="alert bg-base-200 justify-center">No portfolio items yet.</div>
                    ) : (
                        <div className="grid grid-cols-3 gap-1 md:gap-4">
                            {portfolio.map(item => (
                                <div key={item.id} className="aspect-square relative group overflow-hidden bg-base-200 cursor-pointer">
                                    <img
                                        src={item.image_url}
                                        alt={item.caption || "Portfolio item"}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
                                        <div className="flex items-center gap-1">
                                            <Heart size={20} className="fill-white" />
                                            <span className="font-bold">24</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MessageCircle size={20} className="fill-white" />
                                            <span className="font-bold">4</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Services Section */}
                <div id="services-section" className="mb-12 scroll-mt-24">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Camera className="text-primary" /> Services & Bookings
                        </h3>
                        {isOwner && (
                            <button onClick={() => setIsAddServiceOpen(true)} className="btn btn-sm btn-outline gap-2">
                                <Plus size={16} /> Add Service
                            </button>
                        )}
                    </div>

                    {services.length === 0 ? (
                        <div className="alert bg-base-200">No services listed yet.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {services.map(service => (
                                <div key={service.id} className="card bg-base-100 border border-base-200 hover:border-primary/50 transition-colors">
                                    <div className="card-body p-6">
                                        <div className="flex justify-between items-start">
                                            <h4 className="card-title text-lg">{service.title}</h4>
                                            <span className="badge badge-lg badge-ghost font-bold text-secondary">${service.price}</span>
                                        </div>
                                        <p className="text-sm opacity-70 my-2">
                                            {service.description}
                                        </p>
                                        <div className="card-actions justify-end mt-2">
                                            <button
                                                onClick={() => handleBookClick(service)}
                                                className="btn btn-primary btn-sm w-full"
                                                disabled={isOwner}
                                            >
                                                Book Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="divider"></div>

                {/* Reviews */}
                <ReviewSection photographerId={id} />

            </div>

            {/* Booking Modal */}
            {selectedService && (
                <BookingModal
                    isOpen={isBookingModalOpen}
                    onClose={() => setIsBookingModalOpen(false)}
                    service={selectedService}
                    photographer={profile}
                    onSuccess={() => {
                        toast.success("Booking request sent successfully!")
                    }}
                />
            )}

            {/* Add Portfolio Modal */}
            {isAddPortfolioOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="modal-box w-full max-w-md">
                        <h3 className="font-bold text-lg mb-4">Add to Portfolio</h3>
                        <form onSubmit={handleAddPortfolio}>
                            <div className="form-control mb-4">
                                <label className="label">
                                    <span className="label-text">Select Image</span>
                                </label>
                                <input type="file" accept="image/*" onChange={handlePortfolioImageSelect} className="file-input file-input-bordered w-full" required />
                            </div>
                            {portfolioPreview && (
                                <div className="mb-4">
                                    <img src={portfolioPreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                                </div>
                            )}
                            <div className="form-control mb-4">
                                <label className="label">
                                    <span className="label-text">Caption (Optional)</span>
                                </label>
                                <input type="text" value={newPortfolioCaption} onChange={(e) => setNewPortfolioCaption(e.target.value)} className="input input-bordered w-full" placeholder="Cruising the streets..." />
                            </div>
                            <div className="modal-action">
                                <button type="button" onClick={() => setIsAddPortfolioOpen(false)} className="btn">Cancel</button>
                                <button type="submit" className="btn btn-primary">Upload</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Service Modal */}
            {isAddServiceOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="modal-box w-full max-w-md">
                        <h3 className="font-bold text-lg mb-4">Add New Service</h3>
                        <form onSubmit={handleAddService}>
                            <div className="form-control mb-4">
                                <label className="label">
                                    <span className="label-text">Service Title</span>
                                </label>
                                <input type="text" value={newService.title} onChange={(e) => setNewService({ ...newService, title: e.target.value })} className="input input-bordered w-full" placeholder="e.g. 1 Hour Portrait" required />
                            </div>
                            <div className="form-control mb-4">
                                <label className="label">
                                    <span className="label-text">Description</span>
                                </label>
                                <textarea value={newService.description} onChange={(e) => setNewService({ ...newService, description: e.target.value })} className="textarea textarea-bordered w-full" placeholder="What's included?" required></textarea>
                            </div>
                            <div className="form-control mb-4">
                                <label className="label">
                                    <span className="label-text">Price ($)</span>
                                </label>
                                <input type="number" value={newService.price} onChange={(e) => setNewService({ ...newService, price: e.target.value })} className="input input-bordered w-full" placeholder="100" required />
                            </div>
                            <div className="modal-action">
                                <button type="button" onClick={() => setIsAddServiceOpen(false)} className="btn">Cancel</button>
                                <button type="submit" className="btn btn-primary">Add Service</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
