import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ArrowRight } from 'lucide-react'

export default function SignUp() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [username, setUsername] = useState('')
    const [role, setRole] = useState('customer')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const { signUp } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            return setError("Passwords do not match")
        }
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

            <div className="w-full max-w-lg mx-auto flex flex-col justify-center px-8 md:px-16 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2 tracking-tighter">Create Account</h1>
                    <p className="text-base text-base-content/60">Join the community to start capturing moments.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="alert alert-error rounded-lg">{error}</div>}

                    <div className="form-control">
                        <label className="label pl-0">
                            <span className="label-text font-medium">Full Name</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Jane Doe"
                            className="input input-bordered bg-base-100/50 backdrop-blur-sm w-full focus:outline-none focus:border-primary transition-all"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-control">
                        <label className="label pl-0">
                            <span className="label-text font-medium">Username</span>
                        </label>
                        <label className="input input-bordered bg-base-100/50 backdrop-blur-sm w-full focus-within:border-primary transition-all flex items-center gap-2">
                            <span className="opacity-70 font-mono">@</span>
                            <input
                                type="text"
                                placeholder="janedoe"
                                className="grow bg-transparent focus:outline-none"
                                value={username}
                                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))} // Auto-format username
                                required
                                pattern="^[a-z0-9_]+$"
                                title="Username can only contain lowercase letters, numbers, and underscores."
                            />
                        </label>
                    </div>

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
                    </div>

                    <div className="form-control">
                        <label className="label pl-0">
                            <span className="label-text font-medium">Re-enter Password</span>
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="input input-bordered bg-base-100/50 backdrop-blur-sm w-full focus:outline-none focus:border-primary transition-all"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    {/* Role Selection */}
                    <div className="form-control bg-base-200 p-3 rounded-lg mb-4">
                        <label className="label cursor-pointer justify-start gap-4">
                            <span className="label-text font-bold">I am a Photographer</span>
                            <input
                                type="checkbox"
                                className="toggle toggle-sm toggle-primary"
                                checked={role === 'photographer'}
                                onChange={(e) => setRole(e.target.checked ? 'photographer' : 'customer')}
                            />
                        </label>
                        <p className="text-xs opacity-70 mt-1">
                            Switch this on to enable photographer features like Dashboard.
                        </p>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full mt-6 shadow-lg shadow-primary/30 hover:scale-[1.02] transition-transform"
                        disabled={loading}
                    >
                        {loading ? <span className="loading loading-spinner"></span> : (
                            <span className="flex items-center gap-2">Create Account <ArrowRight size={18} /></span>
                        )}
                    </button>
                </form>

                <p className="text-center mt-6 text-base-content/60 text-sm">
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
