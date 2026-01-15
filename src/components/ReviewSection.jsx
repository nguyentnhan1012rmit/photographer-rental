import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Star, MessageSquare } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-hot-toast'

export default function ReviewSection({ photographerId }) {
    const { user } = useAuth()
    const [reviews, setReviews] = useState([])
    const [averageRating, setAverageRating] = useState(0)
    // eslint-disable-next-line no-unused-vars
    const [loading, setLoading] = useState(true)

    // Form state
    const [newReview, setNewReview] = useState({ rating: 5, content: '' })
    const [userCanReview, setUserCanReview] = useState(false)
    const [bookingIdToReview, setBookingIdToReview] = useState(null)

    const fetchReviews = useCallback(async () => {
        const { data } = await supabase
            .from('reviews')
            .select(`
                *,
                customer:customer_id(full_name, avatar_url)
            `)
            .eq('photographer_id', photographerId)
            .order('created_at', { ascending: false })

        if (data) {
            setReviews(data)
            const avg = data.reduce((acc, curr) => acc + curr.rating, 0) / (data.length || 1)
            setAverageRating(data.length ? avg.toFixed(1) : 0)
        }
        setLoading(false)
    }, [photographerId])

    const checkEligibility = useCallback(async () => {
        // Check if user has a completed booking with this photographer that isn't reviewed yet
        const { data: bookings } = await supabase
            .from('bookings')
            .select('id')
            .eq('customer_id', user.id)
            .eq('photographer_id', photographerId)
            .eq('status', 'completed')

        if (!bookings || bookings.length === 0) return

        // Check if already reviewed
        const { data: existingReviews } = await supabase
            .from('reviews')
            .select('booking_id')
            .in('booking_id', bookings.map(b => b.id))

        const reviewedBookingIds = existingReviews?.map(r => r.booking_id) || []
        const eligibleBooking = bookings.find(b => !reviewedBookingIds.includes(b.id))

        if (eligibleBooking) {
            setUserCanReview(true)
            setBookingIdToReview(eligibleBooking.id)
        }
    }, [user, photographerId])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchReviews()
        if (user) checkEligibility()
    }, [photographerId, user, fetchReviews, checkEligibility])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!bookingIdToReview) return

        const { error } = await supabase.from('reviews').insert({
            photographer_id: photographerId,
            customer_id: user.id,
            booking_id: bookingIdToReview,
            rating: newReview.rating,
            content: newReview.content
        })

        if (!error) {
            toast.success("Review posted!")
            setNewReview({ rating: 5, content: '' })
            setUserCanReview(false) // One review per booking
            fetchReviews()
        } else {
            toast.error("Failed to post review")
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                    <MessageSquare className="text-primary" /> Reviews
                </h3>
                <div className="badge badge-lg badge-neutral gap-2">
                    <Star size={16} className="text-warning fill-warning" />
                    {averageRating} ({reviews.length})
                </div>
            </div>

            {userCanReview && (
                <div className="card bg-base-200 border border-base-300">
                    <div className="card-body p-4">
                        <h4 className="font-bold text-sm mb-2">Write a Review</h4>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div className="rating rating-sm">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <input
                                        key={star}
                                        type="radio"
                                        name="rating"
                                        className="mask mask-star-2 bg-warning"
                                        checked={newReview.rating === star}
                                        onChange={() => setNewReview({ ...newReview, rating: star })}
                                    />
                                ))}
                            </div>
                            <textarea
                                className="textarea textarea-bordered w-full"
                                placeholder="How was your experience?"
                                value={newReview.content}
                                onChange={e => setNewReview({ ...newReview, content: e.target.value })}
                                required
                            ></textarea>
                            <button className="btn btn-primary btn-sm">Post Review</button>
                        </form>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {reviews.length === 0 ? (
                    <div className="text-sm opacity-50">No reviews yet.</div>
                ) : reviews.map(review => (
                    <div key={review.id} className="card bg-base-100 border border-base-200">
                        <div className="card-body p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="avatar placeholder">
                                        <div className="w-8 rounded-full bg-neutral text-neutral-content">
                                            <span>{review.customer?.full_name?.[0]}</span>
                                        </div>
                                    </div>
                                    <span className="font-bold text-sm">{review.customer?.full_name}</span>
                                </div>
                                <div className="flex text-warning">
                                    {[...Array(review.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                                </div>
                            </div>
                            <p className="text-sm opacity-80">{review.content}</p>
                            <div className="text-xs opacity-50 mt-2">{new Date(review.created_at).toLocaleDateString()}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
