import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
    const { user, signOut } = useAuth()
    const navigate = useNavigate()

    const handleSignOut = async () => {
        await signOut()
        navigate('/')
    }

    return (
        <div className="navbar bg-base-100 shadow-sm border-b border-base-200 px-6 md:px-12">
            <div className="flex-1">
                <Link to="/" className="btn btn-ghost text-2xl font-bold tracking-tight text-primary">LensLocker</Link>

                <div className="hidden md:flex gap-4 ml-4">
                    <Link to="/feed" className="btn btn-ghost btn-sm">Community Feed</Link>
                    <Link to="/photographers" className="btn btn-ghost btn-sm">Find Photographers</Link>
                </div>
            </div>
            <div className="flex-none gap-2">
                {!user ? (
                    <>
                        <Link to="/login" className="btn btn-sm btn-ghost">Log In</Link>
                        <Link to="/signup" className="btn btn-sm btn-primary">Join as Photographer</Link>
                    </>
                ) : (
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar placeholder">
                            <div className="bg-neutral text-neutral-content rounded-full w-10">
                                <span className="text-xs">{user.email?.charAt(0).toUpperCase()}</span>
                            </div>
                        </div>
                        <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
                            <li><Link to="/dashboard">Dashboard</Link></li>
                            <li><button onClick={handleSignOut}>Logout</button></li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    )
}
