import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { toast } from 'react-hot-toast'
import { CreditCard, Lock, CheckCircle } from 'lucide-react'

export default function PaymentPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const [loading, setLoading] = useState(false)
    const [bookingDetails, setBookingDetails] = useState(location.state?.booking || null)

    useEffect(() => {
        if (!bookingDetails) {
            toast.error("No booking found")
            navigate('/photographers')
        }
    }, [bookingDetails])

    const handlePayment = async (e) => {
        e.preventDefault()
        setLoading(true)

        // Simulate API call
        setTimeout(async () => {
            // Update booking status to confirmed (mock)
            // In a real app, we'd update this after Stripe webhook
            if (bookingDetails?.id) {
                // If it's a real created booking, update it. 
                // However, our flow currently creates 'pending' booking first.
                // Let's assume we are paying for that pending booking.

                const { error } = await supabase
                    .from('bookings')
                    .update({ status: 'confirmed' })
                    .eq('id', bookingDetails.id)

                if (!error) {
                    toast.success("Payment Successful! Booking Confirmed.")
                    navigate('/my-bookings')
                } else {
                    toast.error("Payment failed (DB error)")
                }
            } else {
                // If booking wasn't created yet -> create it now
                const { error } = await supabase
                    .from('bookings')
                    .insert({
                        ...bookingDetails,
                        status: 'confirmed'
                    })

                if (!error) {
                    toast.success("Payment Successful! Booking Confirmed.")
                    navigate('/my-bookings')
                } else {
                    console.error(error)
                    toast.error("Booking Creation Failed")
                }
            }
            setLoading(false)
        }, 2000)
    }

    if (!bookingDetails) return null

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
            <div className="card w-full max-w-md bg-base-100 shadow-xl border border-base-300">
                <div className="card-body">
                    <h2 className="card-title text-2xl mb-4 flex items-center gap-2">
                        <Lock size={20} className="text-success" /> Secure Checkout
                    </h2>

                    <div className="bg-base-200 p-4 rounded-lg mb-6 space-y-2">
                        <div className="flex justify-between font-bold">
                            <span>Total Amount</span>
                            <span>${bookingDetails.price}</span>
                        </div>
                        <div className="text-xs opacity-70">Service: {bookingDetails.serviceTitle}</div>
                    </div>

                    <form onSubmit={handlePayment} className="space-y-4">
                        <div className="form-control">
                            <label className="label text-xs">Card Number</label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" size={16} />
                                <input type="text" className="input input-bordered w-full pl-10" placeholder="0000 0000 0000 0000" required defaultValue="4242 4242 4242 4242" />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="form-control w-1/2">
                                <label className="label text-xs">Expiry</label>
                                <input type="text" className="input input-bordered w-full" placeholder="MM/YY" required defaultValue="12/28" />
                            </div>
                            <div className="form-control w-1/2">
                                <label className="label text-xs">CVC</label>
                                <input type="text" className="input input-bordered w-full" placeholder="123" required defaultValue="123" />
                            </div>
                        </div>

                        <div className="divider"></div>

                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={loading}
                        >
                            {loading ? <span className="loading loading-spinner"></span> : `Pay $${bookingDetails.price}`}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
