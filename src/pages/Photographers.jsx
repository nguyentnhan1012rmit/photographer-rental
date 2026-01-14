import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { MapPin, User, ArrowRight } from 'lucide-react'

export default function Photographers() {
    const [photographers, setPhotographers] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        async function fetchPhotographers() {
            setLoading(true)
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'photographer')

            if (data) setPhotographers(data)
            setLoading(false)
        }
        fetchPhotographers()
    }, [])

    return (
        <div className="container mx-auto p-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Professional Photographers</h1>

            {loading ? (
                <div className="flex justify-center p-12">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                    {photographers.map(p => (
                        <div key={p.id} className="group cursor-pointer" onClick={() => navigate(`/photographer/${p.id}`)}>
                            <figure className="h-64 w-full bg-base-300 relative overflow-hidden rounded-xl mb-4 group-hover:brightness-110 transition-all">
                                {/* Placeholder for cover image if we had one */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                                <div className="absolute bottom-4 left-4 text-white">
                                    <h2 className="text-2xl font-bold flex items-center gap-2">
                                        {p.full_name || 'Unknown Photographer'}
                                        <div className="badge badge-secondary badge-sm">Pro</div>
                                    </h2>
                                    {p.location && (
                                        <div className="flex items-center text-sm opacity-90 gap-1">
                                            <MapPin size={14} /> {p.location}
                                        </div>
                                    )}
                                </div>

                                <div className="absolute top-4 right-4">
                                    <div className="avatar placeholder">
                                        <div className="w-12 rounded-full ring ring-white/20 bg-neutral text-neutral-content">
                                            {p.avatar_url ? (
                                                <img src={p.avatar_url} alt={p.full_name} />
                                            ) : (
                                                <span className="text-xl font-bold">
                                                    {p.full_name?.charAt(0) || <User />}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </figure>

                            <div>
                                <p className="text-base-content/70 line-clamp-2 mb-3 h-12">
                                    {p.bio || "No bio available yet."}
                                </p>
                                <button className="btn btn-link btn-sm p-0 text-primary no-underline hover:opacity-70 group-hover:translate-x-2 transition-transform">
                                    View Profile <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {photographers.length === 0 && (
                        <div className="col-span-full text-center py-20 text-base-content/40">
                            <User size={48} className="mx-auto mb-4 opacity-50" />
                            <h3 className="font-bold text-xl">No photographers have joined yet.</h3>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
