import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ArrowRight } from 'lucide-react'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const { signIn } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        const { error } = await signIn({ email, password })
        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            navigate('/dashboard')
        }
    }

    return (
        <div className="flex min-h-screen bg-base-100 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-primary/10 to-transparent -z-10 blur-3xl opacity-50"></div>
            <div className="absolute bottom-0 right-0 w-1/2 h-full bg-gradient-to-l from-secondary/10 to-transparent -z-10 blur-3xl opacity-50"></div>

            <div className="w-full max-w-lg mx-auto flex flex-col justify-center px-8 md:px-16 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2 tracking-tighter">Welcome Back</h1>
                    <p className="text-base text-base-content/60">Enter your details to access your account.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="alert alert-error rounded-lg">{error}</div>}

                    <div className="form-control">
                        <label className="label pl-0">
                            <span className="label-text font-medium">Email</span>
                        </label>
                        <input
                            type="email"
                            placeholder="name@example.com"
                            className="input input-bordered bg-base-100/50 backdrop-blur-sm w-full focus:outline-none focus:border-primary transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-control">
                        <label className="label pl-0">
                            <span className="label-text font-medium">Password</span>
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="input input-bordered bg-base-100/50 backdrop-blur-sm w-full focus:outline-none focus:border-primary transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <label className="label justify-end">
                            <a href="#" className="label-text-alt link link-hover">Forgot password?</a>
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full mt-6 shadow-lg shadow-primary/30 hover:scale-[1.02] transition-transform"
                        disabled={loading}
                    >
                        {loading ? <span className="loading loading-spinner"></span> : (
                            <span className="flex items-center gap-2">Sign In <ArrowRight size={18} /></span>
                        )}
                    </button>
                </form>

                <p className="text-center mt-6 text-base-content/60 text-sm">
                    Don't have an account? <Link to="/signup" className="text-primary font-semibold hover:underline">Sign up</Link>
                </p>
            </div>

            {/* Right side artistic placeholder for large screens */}
            <div className="hidden lg:flex w-1/2 bg-base-200 items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-neutral opacity-10 pattern-grid-lg"></div>
                <h2 className="text-9xl font-bold opacity-5 rotate-12 select-none">Login</h2>
            </div>
        </div>
    )
}
