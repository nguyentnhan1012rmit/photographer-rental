import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { MapPin, Mail, Calendar, Camera, Star, ArrowLeft } from 'lucide-react'
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
    const [loading, setLoading] = useState(true)

    // Booking State
    const [selectedService, setSelectedService] = useState(null)
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

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
        <div className="min-h-screen pb-20">
            {/* Header / Cover */}
            <div className="h-64 bg-gradient-to-r from-primary/20 to-secondary/20 relative">
                <div className="container mx-auto px-4 h-full relative">
                    <button
                        onClick={() => navigate('/photographers')}
                        className="absolute top-8 left-4 btn btn-circle btn-sm bg-base-100/50 backdrop-blur border-none hover:bg-base-100"
                    >
                        <ArrowLeft size={18} />
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-20">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Profile Info */}
                    <div className="w-full md:w-1/3 lg:w-1/4">
                        <div className="card bg-base-100 shadow-xl border border-base-200">
                            <div className="card-body items-center text-center">
                                <div className="avatar mb-4">
                                    <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                        {profile.avatar_url ? (
                                            <img src={profile.avatar_url} alt={profile.full_name} />
                                        ) : (
                                            <div className="bg-neutral text-neutral-content w-full h-full flex items-center justify-center text-4xl font-bold">
                                                {profile.full_name?.[0]}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <h2 className="card-title text-2xl">{profile.full_name}</h2>
                                {profile.location && (
                                    <div className="flex items-center gap-1 text-sm opacity-70">
                                        <MapPin size={14} /> {profile.location}
                                    </div>
                                )}

                                <div className="divider my-2"></div>

                                <p className="text-left w-full text-sm opacity-80 mb-4">
                                    {profile.bio || "No bio available."}
                                </p>

                                <div className="w-full flex flex-col gap-2">
                                    <button
                                        onClick={() => {
                                            navigate('/inbox', { state: { startChatWith: profile } })
                                        }}
                                        className="btn btn-outline btn-sm w-full gap-2"
                                    >
                                        <Mail size={16} /> Message
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="w-full md:w-2/3 lg:w-3/4 space-y-8">

                        {/* Services Section */}
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold flex items-center gap-2">
                                <Camera className="text-primary" /> Services
                            </h3>

                            {services.length === 0 ? (
                                <div className="alert bg-base-200">No services listed yet.</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {services.map(service => (
                                        <div key={service.id} className="card bg-base-100 border border-base-200 hover:border-primary/50 transition-colors cursor-default">
                                            <div className="card-body p-6">
                                                <h4 className="card-title text-lg">{service.title}</h4>
                                                <p className="text-sm opacity-70 min-h-[40px]">
                                                    {service.description}
                                                </p>
                                                <div className="flex items-center justify-between mt-4">
                                                    <span className="text-xl font-bold text-secondary">${service.price}</span>
                                                    <button
                                                        onClick={() => handleBookClick(service)}
                                                        className="btn btn-primary btn-sm"
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

                        {/* Portfolio Section */}
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold flex items-center gap-2">
                                <Star className="text-secondary" /> Portfolio
                            </h3>

                            {portfolio.length === 0 ? (
                                <div className="alert bg-base-200">No portfolio items yet.</div>
                            ) : (
                                <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                                    {portfolio.map(item => (
                                        <div key={item.id} className="break-inside-avoid rounded-xl overflow-hidden bg-base-200 relative group">
                                            <img
                                                src={item.image_url}
                                                alt={item.caption || "Portfolio item"}
                                                className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                                            />
                                            {item.caption && (
                                                <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <p className="text-white text-xs text-center">{item.caption}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="divider"></div>

                        {/* Reviews Section */}
                        <ReviewSection photographerId={id} />

                    </div>
                </div>
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
        </div>
    )
}
