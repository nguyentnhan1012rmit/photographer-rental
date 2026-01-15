import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { Plus, Trash2, Edit2, CheckCircle, XCircle, LayoutGrid, Calendar, Briefcase, Star, Image as ImageIcon } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function PhotographerDashboard() {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState('overview')
    const [loading, setLoading] = useState(true)

    // Data States
    const [bookings, setBookings] = useState([])
    const [services, setServices] = useState([])
    const [portfolio, setPortfolio] = useState([])

    // Form States
    const [isAddServiceOpen, setIsAddServiceOpen] = useState(false)
    const [newService, setNewService] = useState({ title: '', description: '', price: '' })

    const [isAddPortfolioOpen, setIsAddPortfolioOpen] = useState(false)
    const [newPortfolio, setNewPortfolio] = useState({ image_url: '', caption: '' })

    const fetchAllData = useCallback(async () => {
        setLoading(true)
        // Fetch Bookings (as photographer)
        const { data: bookingsData } = await supabase
            .from('bookings')
            .select(`
                *,
                customer:customer_id(full_name, avatar_url),
                service:service_id(title, price)
            `)
            .eq('photographer_id', user.id)
            .order('booking_date', { ascending: false })

        if (bookingsData) setBookings(bookingsData)

        // Fetch Services
        const { data: servicesData } = await supabase
            .from('services')
            .select('*')
            .eq('photographer_id', user.id)
        if (servicesData) setServices(servicesData)

        // Fetch Portfolio
        const { data: portfolioData } = await supabase
            .from('portfolio_items')
            .select('*')
            .eq('photographer_id', user.id)
            .order('created_at', { ascending: false })
        if (portfolioData) setPortfolio(portfolioData)

        setLoading(false)
    }, [user])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (user) fetchAllData()
    }, [user, fetchAllData])

    const handleUpdateBooking = async (id, status) => {
        await supabase.from('bookings').update({ status }).eq('id', id)
        toast.success(`Booking ${status} successfully`)
        fetchAllData()
    }

    const handleAddService = async (e) => {
        e.preventDefault()
        await supabase.from('services').insert({
            photographer_id: user.id,
            ...newService
        })
        setNewService({ title: '', description: '', price: '' })
        setIsAddServiceOpen(false)
        toast.success("Service added successfully")
        fetchAllData()
    }

    const handleDeleteService = async (id) => {
        if (!confirm('Are you sure?')) return
        await supabase.from('services').delete().eq('id', id)
        toast.success("Service removed")
        fetchAllData()
    }

    const handleAddPortfolio = async (e) => {
        e.preventDefault()
        await supabase.from('portfolio_items').insert({
            photographer_id: user.id,
            ...newPortfolio
        })
        setNewPortfolio({ image_url: '', caption: '' })
        setIsAddPortfolioOpen(false)
        toast.success("Portfolio item added")
        fetchAllData()
    }

    const handleDeletePortfolio = async (id) => {
        if (!confirm('Are you sure?')) return
        await supabase.from('portfolio_items').delete().eq('id', id)
        toast.success("Portfolio item removed")
        fetchAllData()
    }

    if (loading) return (
        <div className="flex justify-center p-12">
            <span className="loading loading-spinner text-primary"></span>
        </div>
    )

    return (
        <div className="container mx-auto p-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Photographer Dashboard</h1>

            {/* Tabs */}
            <div role="tablist" className="tabs tabs-boxed bg-base-200 mb-8 p-1">
                <a
                    role="tab"
                    className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    <LayoutGrid size={16} className="mr-2" /> Overview
                </a>
                <a
                    role="tab"
                    className={`tab ${activeTab === 'bookings' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('bookings')}
                >
                    <Calendar size={16} className="mr-2" /> Bookings
                    {bookings.filter(b => b.status === 'pending').length > 0 && (
                        <div className="badge badge-secondary badge-xs ml-2"></div>
                    )}
                </a>
                <a
                    role="tab"
                    className={`tab ${activeTab === 'services' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('services')}
                >
                    <Briefcase size={16} className="mr-2" /> Services
                </a>
                <a
                    role="tab"
                    className={`tab ${activeTab === 'portfolio' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('portfolio')}
                >
                    <ImageIcon size={16} className="mr-2" /> Portfolio
                </a>
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="stat bg-base-100 shadow rounded-box border border-base-200">
                        <div className="stat-title">Total Bookings</div>
                        <div className="stat-value">{bookings.length}</div>
                        <div className="stat-desc">All time</div>
                    </div>

                    <div className="stat bg-base-100 shadow rounded-box border border-base-200">
                        <div className="stat-title">Pending</div>
                        <div className="stat-value text-warning">{bookings.filter(b => b.status === 'pending').length}</div>
                        <div className="stat-desc">Action needed</div>
                    </div>

                    <div className="stat bg-base-100 shadow rounded-box border border-base-200">
                        <div className="stat-title">Earnings (Est.)</div>
                        <div className="stat-value text-success">
                            ${bookings.filter(b => b.status === 'confirmed' || b.status === 'completed')
                                .reduce((acc, curr) => acc + (curr.service?.price || 0), 0)}
                        </div>
                    </div>
                </div>
            )}

            {/* BOOKINGS TAB */}
            {activeTab === 'bookings' && (
                <div className="space-y-4">
                    {bookings.length === 0 ? (
                        <div className="text-center py-10 opacity-50">No bookings found.</div>
                    ) : bookings.map(booking => (
                        <div key={booking.id} className="card bg-base-100 shadow border border-base-200">
                            <div className="card-body p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className="avatar placeholder">
                                        <div className="w-12 rounded-full bg-neutral text-neutral-content">
                                            <span>{booking.customer?.full_name?.[0]}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold">{booking.service?.title} <span className="text-sm font-normal opacity-70">({booking.service?.price ? `$${booking.service.price}` : 'Price N/A'})</span></h4>
                                        <p className="text-sm">For: {booking.customer?.full_name}</p>
                                        <div className="text-xs opacity-70">{new Date(booking.booking_date).toDateString()}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {booking.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleUpdateBooking(booking.id, 'confirmed')}
                                                className="btn btn-success btn-sm text-white"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleUpdateBooking(booking.id, 'cancelled')}
                                                className="btn btn-error btn-sm text-white"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    <div className={`badge badge-outline ${booking.status === 'confirmed' ? 'badge-success' :
                                        booking.status === 'cancelled' ? 'badge-error' : 'badge-ghost'
                                        }`}>
                                        {booking.status.toUpperCase()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* SERVICES TAB */}
            {activeTab === 'services' && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">My Services</h3>
                        <button onClick={() => setIsAddServiceOpen(!isAddServiceOpen)} className="btn btn-primary btn-sm">
                            <Plus size={16} /> Add Service
                        </button>
                    </div>

                    {isAddServiceOpen && (
                        <div className="card bg-base-200 mb-6 animate-in fade-in slide-in-from-top-4">
                            <div className="card-body p-4">
                                <form onSubmit={handleAddService} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                    <div className="form-control md:col-span-2">
                                        <label className="label text-xs">Title</label>
                                        <input
                                            type="text"
                                            className="input input-sm input-bordered"
                                            required
                                            value={newService.title}
                                            onChange={e => setNewService({ ...newService, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-control">
                                        <label className="label text-xs">Price ($)</label>
                                        <input
                                            type="number"
                                            className="input input-sm input-bordered"
                                            required
                                            value={newService.price}
                                            onChange={e => setNewService({ ...newService, price: e.target.value })}
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-sm btn-primary">Save</button>
                                </form>
                                <div className="form-control">
                                    <label className="label text-xs">Description</label>
                                    <textarea
                                        className="textarea textarea-sm textarea-bordered"
                                        value={newService.description}
                                        onChange={e => setNewService({ ...newService, description: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {services.map(service => (
                            <div key={service.id} className="card bg-base-100 border border-base-200">
                                <div className="card-body p-4">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold">{service.title}</h4>
                                        <div className="badge badge-lg badge-neutral">${service.price}</div>
                                    </div>
                                    <p className="text-sm opacity-70 my-2">{service.description}</p>
                                    <div className="card-actions justify-end">
                                        <button
                                            onClick={() => handleDeleteService(service.id)}
                                            className="btn btn-ghost btn-xs text-error"
                                        >
                                            <Trash2 size={14} /> Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* PORTFOLIO TAB */}
            {activeTab === 'portfolio' && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">My Portfolio</h3>
                        <button onClick={() => setIsAddPortfolioOpen(!isAddPortfolioOpen)} className="btn btn-primary btn-sm">
                            <Plus size={16} /> Add Image
                        </button>
                    </div>

                    {isAddPortfolioOpen && (
                        <div className="card bg-base-200 mb-6">
                            <div className="card-body p-4">
                                <form onSubmit={handleAddPortfolio} className="space-y-4">
                                    <div className="form-control">
                                        <label className="label text-xs">Image URL</label>
                                        <input
                                            type="url"
                                            className="input input-sm input-bordered"
                                            placeholder="https://..."
                                            required
                                            value={newPortfolio.image_url}
                                            onChange={e => setNewPortfolio({ ...newPortfolio, image_url: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-control">
                                        <label className="label text-xs">Caption</label>
                                        <input
                                            type="text"
                                            className="input input-sm input-bordered"
                                            value={newPortfolio.caption}
                                            onChange={e => setNewPortfolio({ ...newPortfolio, caption: e.target.value })}
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-sm btn-primary w-full">Upload</button>
                                </form>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {portfolio.map(item => (
                            <div key={item.id} className="relative group rounded-xl overflow-hidden aspect-video bg-base-300">
                                <img src={item.image_url} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => handleDeletePortfolio(item.id)}
                                        className="btn btn-circle btn-sm btn-error"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    )
}
