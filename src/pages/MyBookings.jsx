import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { Calendar, Clock, CheckCircle, XCircle, User } from 'lucide-react'

export default function MyBookings() {
    const { user } = useAuth()
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchBookings() {
            setLoading(true)
            const { data, error } = await supabase
                .from('bookings')
                .select(`
                    *,
                    photographer:photographers(full_name, avatar_url, location),
                    service:services(title, price)
                `)
                .eq('customer_id', user.id)
                .order('booking_date', { ascending: false })

            // Note: In the query above, we assume foreign key relationships are named 'photographer_id' -> 'profiles' (aliased as photographer?)
            // If the relationship name is automatic, it might be just 'profiles'.
            // Let's refine the query to be safe with standard Supabase joining.
            // Since both customer and photographer link to 'profiles', we need to specify exactly which one we want.
            // However, Supabase syntax is usually:
            // select('*, photographer:photographer_id(full_name), service:service_id(title)')

            // Let's try the safer syntax:
            const { data: safeData } = await supabase
                .from('bookings')
                .select(`
                    *,
                    photographer:photographer_id (
                        full_name,
                        avatar_url,
                        location
                    ),
                    service:service_id (
                        title,
                        price
                    )
                `)
                .eq('customer_id', user.id)
                .order('booking_date', { ascending: false })

            if (safeData) setBookings(safeData)
            setLoading(false)
        }

        if (user) fetchBookings()
    }, [user])

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'text-success';
            case 'completed': return 'text-info';
            case 'cancelled': return 'text-error';
            default: return 'text-warning';
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'confirmed': return <CheckCircle size={16} />;
            case 'completed': return <CheckCircle size={16} />;
            case 'cancelled': return <XCircle size={16} />;
            default: return <Clock size={16} />;
        }
    }

    return (
        <div className="container mx-auto p-4 py-8">
            <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

            {loading ? (
                <div className="flex justify-center p-12">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                </div>
            ) : bookings.length === 0 ? (
                <div className="text-center py-20 bg-base-100 rounded-3xl border border-dashed border-base-content/20">
                    <Calendar size={48} className="mx-auto mb-4 opacity-30" />
                    <h3 className="font-bold text-xl opacity-60">No bookings yet</h3>
                    <p className="text-sm opacity-50 mb-6">Find a photographer to get started.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {bookings.map(booking => (
                        <div key={booking.id} className="card bg-base-100 shadow border border-base-200">
                            <div className="card-body p-6 flex flex-row items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="avatar placeholder">
                                        <div className="w-12 rounded-full bg-neutral text-neutral-content">
                                            {booking.photographer?.avatar_url ?
                                                <img src={booking.photographer.avatar_url} /> :
                                                <span>{booking.photographer?.full_name?.[0]}</span>
                                            }
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold">{booking.service?.title}</h4>
                                        <div className="text-sm opacity-70 flex items-center gap-2">
                                            <User size={12} /> {booking.photographer?.full_name}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row items-end md:items-center gap-2 md:gap-8">
                                    <div className="text-right md:text-left">
                                        <div className="font-mono text-sm opacity-70 flex items-center gap-1 justify-end md:justify-start">
                                            <Calendar size={12} />
                                            {new Date(booking.booking_date).toLocaleDateString()}
                                        </div>
                                        <div className="font-bold text-lg">
                                            ${booking.service?.price}
                                        </div>
                                    </div>

                                    <div className={`badge badge-lg gap-2 ${getStatusColor(booking.status)} bg-base-200 border-none`}>
                                        {getStatusIcon(booking.status)}
                                        {booking.status.toUpperCase()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
