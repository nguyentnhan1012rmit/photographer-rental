import { useState } from 'react'
import { Calendar as CalendarIcon, X, Check } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'

export default function BookingModal({ service, photographer, isOpen, onClose }) {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [bookingDate, setBookingDate] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    if (!isOpen) return null

    const handleBooking = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // Create booking record as pending
            const { data, error: bookingError } = await supabase
                .from('bookings')
                .insert({
                    customer_id: user.id,
                    photographer_id: photographer.id,
                    service_id: service.id,
                    booking_date: new Date(bookingDate).toISOString(),
                    status: 'pending' // pending payment/approval
                })
                .select()
                .single()

            if (bookingError) {
                throw bookingError
            }

            onClose()
            // Navigate to payment
            navigate('/payment', {
                state: {
                    booking: {
                        id: data.id,
                        price: service.price,
                        serviceTitle: service.title
                    }
                }
            })
            toast.success("Booking initiated. Please complete payment.")

        } catch (err) {
            setError(err.message)
            toast.error(`Booking failed: ${err.message}`)
            console.error("Booking error:", err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-base-100 rounded-3xl shadow-xl w-full max-w-md border border-white/10 overflow-hidden relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 btn btn-circle btn-sm btn-ghost hover:rotate-90 transition-transform"
                >
                    <X size={20} />
                </button>

                <div className="p-8">
                    <h3 className="text-2xl font-bold mb-2">Book Service</h3>
                    <p className="text-base-content/60 mb-6">
                        Requesting <span className="text-primary font-semibold">{service.title}</span> from {photographer.full_name}
                    </p>

                    {error && (
                        <div className="alert alert-error text-sm py-2 mb-4">
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleBooking} className="space-y-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Select Date</span>
                            </label>
                            <label className="input input-bordered flex items-center gap-2">
                                <CalendarIcon size={18} className="opacity-60" />
                                <input
                                    type="date"
                                    required
                                    className="grow"
                                    value={bookingDate}
                                    onChange={(e) => setBookingDate(e.target.value)}
                                    // Basic disabling of past dates
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </label>
                        </div>

                        <div className="bg-base-200 p-4 rounded-xl space-y-2 mt-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="opacity-70">Price</span>
                                <span className="font-semibold text-lg">${service.price}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="opacity-70">Service Fee</span>
                                <span className="font-semibold text-lg">$0.00</span>
                            </div>
                            <div className="divider my-1"></div>
                            <div className="flex justify-between items-center">
                                <span className="font-bold">Total</span>
                                <span className="font-bold text-xl text-primary">${service.price}</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full mt-2"
                        >
                            {loading ? <span className="loading loading-spinner"></span> : (
                                <>
                                    Confirm Booking <Check size={18} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
