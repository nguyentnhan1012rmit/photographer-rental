import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ArrowRight } from 'lucide-react'

export default function SignUp() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [username, setUsername] = useState('')
    const [role, setRole] = useState('customer')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const { signUp } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        const { error } = await signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    username: username,
                    role: role,
                }
            }
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            navigate('/login')
        }
    }

    return (
        <div className="flex min-h-screen bg-base-100 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent -z-10 blur-3xl opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-r from-secondary/10 to-transparent -z-10 blur-3xl opacity-50"></div>

            <div className="w-full max-w-lg mx-auto flex flex-col justify-center px-8 md:px-16 py-12">
                <div className="mb-12">
                    <h1 className="text-5xl font-bold mb-4 tracking-tighter">Create Account</h1>
                    <p className="text-xl text-base-content/60">Join the community to start capturing moments.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <div className="alert alert-error rounded-lg">{error}</div>}

                    {/* Role Selection */}
                    {/* Role Selection */}
                    <div className="form-control bg-base-200 p-4 rounded-xl mb-6">
                        <label className="label cursor-pointer justify-start gap-4">
                            <span className="label-text font-bold text-lg">I am a Creator</span>
                            <input
                                type="checkbox"
                                className="toggle toggle-primary toggle-lg"
                                checked={role === 'photographer'}
                                onChange={(e) => setRole(e.target.checked ? 'photographer' : 'customer')}
                            />
                        </label>
                        <p className="text-sm opacity-70 mt-1 ml-1">
                            Switch this on if you want to offer your services as a photographer.
                        </p>
                    </div>

                    <div className="form-control">
                        <label className="label pl-0">
                            <span className="label-text font-medium text-lg">Full Name</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Jane Doe"
                            className="input input-lg input-bordered bg-base-100/50 backdrop-blur-sm w-full focus:outline-none focus:border-primary transition-all"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-control">
                        <label className="label pl-0">
                            <span className="label-text font-medium text-lg">Username</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. janedoe"
                            className="input input-lg input-bordered bg-base-100/50 backdrop-blur-sm w-full focus:outline-none focus:border-primary transition-all"
                            value={username}
                            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))} // Auto-format username
                            required
                            pattern="^[a-z0-9_]+$"
                            title="Username can only contain lowercase letters, numbers, and underscores."
                        />
                    </div>

                    <div className="form-control">
                        <label className="label pl-0">
                            <span className="label-text font-medium text-lg">Email</span>
                        </label>
                        <input
                            type="email"
                            placeholder="name@example.com"
                            className="input input-lg input-bordered bg-base-100/50 backdrop-blur-sm w-full focus:outline-none focus:border-primary transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-control">
                        <label className="label pl-0">
                            <span className="label-text font-medium text-lg">Password</span>
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="input input-lg input-bordered bg-base-100/50 backdrop-blur-sm w-full focus:outline-none focus:border-primary transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg w-full mt-8 shadow-lg shadow-primary/30 hover:scale-[1.02] transition-transform"
                        disabled={loading}
                    >
                        {loading ? <span className="loading loading-spinner"></span> : (
                            <span className="flex items-center gap-2">Create Account <ArrowRight size={20} /></span>
                        )}
                    </button>
                </form>

                <p className="text-center mt-8 text-base-content/60">
                    Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Log in</Link>
                </p>
            </div>

            {/* Right side artistic placeholder for large screens */}
            <div className="hidden lg:flex w-1/2 bg-base-200 items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-neutral opacity-10 pattern-grid-lg"></div>
                {/* You could add a large image here later */}
                <h2 className="text-9xl font-bold opacity-5 -rotate-12 select-none">PiN</h2>
            </div>
        </div>
    )
}
