import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Settings, LogOut, Moon, ChevronRight, HelpCircle } from 'lucide-react'

export default function Navbar() {
    const { user, signOut } = useAuth()
    const navigate = useNavigate()

    const handleSignOut = async () => {
        await signOut()
        navigate('/')
    }

    return (
        <div className="sticky top-0 z-50 navbar glass-panel px-6 md:px-12 mb-0 rounded-b-2xl">
            <div className="flex-1">
                <Link to="/" className="btn btn-ghost text-3xl font-black tracking-tighter text-primary">PiN</Link>

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
                        <div tabIndex={0} className="mt-3 z-[1] p-2 shadow-2xl menu menu-sm dropdown-content bg-[#242526] rounded-xl w-80 text-white border border-t-[1px] border-white/10">
                            {/* Profile Header */}
                            <div className="p-2 mb-2">
                                <Link
                                    to={`/photographer/${user.id}`}
                                    className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-lg transition-colors shadow-sm border border-white/5"
                                >
                                    <div className="avatar placeholder">
                                        <div className="bg-neutral text-neutral-content rounded-full w-10">
                                            <span className="text-sm">{user.email?.charAt(0).toUpperCase()}</span>
                                        </div>
                                    </div>
                                    <div className="font-bold text-lg">{user.email?.split('@')[0]}</div> {/* Using email as name fallback if full_name not in context immediately, ideally context has profile */}
                                </Link>
                                <div className="divider my-1 opacity-20"></div>
                            </div>

                            {/* Menu Items */}
                            <ul className="space-y-1 px-2 pb-2">
                                <li>
                                    <Link to="/settings" className="flex items-center justify-between py-3 hover:bg-white/10 rounded-lg active:bg-white/20">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                                                <Settings size={20} />
                                            </div>
                                            <span className="font-medium text-base">Settings & privacy</span>
                                        </div>
                                        <ChevronRight size={20} className="opacity-50" />
                                    </Link>
                                </li>
                                <li>
                                    <a className="flex items-center justify-between py-3 hover:bg-white/10 rounded-lg active:bg-white/20">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                                                <HelpCircle size={20} />
                                            </div>
                                            <span className="font-medium text-base">Help & support</span>
                                        </div>
                                        <ChevronRight size={20} className="opacity-50" />
                                    </a>
                                </li>
                                <li>
                                    <a className="flex items-center justify-between py-3 hover:bg-white/10 rounded-lg active:bg-white/20">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                                                <Moon size={20} />
                                            </div>
                                            <span className="font-medium text-base">Display & accessibility</span>
                                        </div>
                                        <ChevronRight size={20} className="opacity-50" />
                                    </a>
                                </li>
                                <li>
                                    <button onClick={handleSignOut} className="flex items-center justify-between py-3 hover:bg-white/10 rounded-lg active:bg-white/20 w-full text-left">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                                                <LogOut size={20} />
                                            </div>
                                            <span className="font-medium text-base">Log out</span>
                                        </div>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

