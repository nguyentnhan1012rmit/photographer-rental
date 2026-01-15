import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { Settings, LogOut, Moon, ChevronRight, HelpCircle, MessageCircle, Compass } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Navbar() {
    const { user, signOut } = useAuth()
    const navigate = useNavigate()
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark')
    const [profile, setProfile] = useState(null)

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('theme', theme)
    }, [theme])

    useEffect(() => {
        if (user) {
            // Fetch latest profile data to ensure username/avatar are up to date
            const fetchProfile = async () => {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()
                if (data) setProfile(data)
            }
            fetchProfile()
        }
    }, [user])

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark')
    }

    const handleSignOut = async () => {
        await signOut()
        navigate('/')
    }

    return (
        <div className="sticky top-0 z-50 navbar glass-panel px-6 md:px-12 mb-0 rounded-b-2xl">
            <div className="flex-1">
                <Link to="/" className="btn btn-ghost text-3xl font-black tracking-tighter text-primary">PiN</Link>

                <div className="hidden md:flex gap-2 ml-4">

                    <Link to="/photographers" className="btn btn-ghost btn-sm">Find Photographers</Link>
                    {user && (
                        (user.role === 'photographer' || user.user_metadata?.role === 'photographer') ? (
                            <Link to="/dashboard" className="btn btn-ghost btn-sm">Dashboard</Link>
                        ) : (
                            <Link to="/my-bookings" className="btn btn-ghost btn-sm">My Bookings</Link>
                        )
                    )}
                </div>
            </div>
            <div className="flex-none gap-2">
                {!user ? (
                    <>
                        <Link to="/login" className="btn btn-sm btn-ghost">Log In</Link>
                        <Link to="/signup" className="btn btn-sm btn-primary">Sign Up</Link>
                    </>
                ) : (
                    <div className="flex items-center gap-2">
                        {user && (
                            <>
                                <Link to="/feed" className="btn btn-ghost btn-circle" title="Community Feed">
                                    <Compass size={24} />
                                </Link>
                                <Link to="/inbox" className="btn btn-ghost btn-circle" title="Inbox">
                                    <MessageCircle size={24} />
                                </Link>
                            </>
                        )}
                        <div className="dropdown dropdown-end">
                            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                                <div className="w-10 rounded-full">
                                    <img
                                        src={profile?.avatar_url || user.user_metadata?.avatar_url || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}
                                        alt="User"
                                        className="avatar-img"
                                    />
                                </div>
                            </div>
                            <div tabIndex={0} className="mt-3 z-[1] p-2 shadow-2xl menu menu-sm dropdown-content card-glass w-80 text-base-content border border-base-content/10">
                                {/* Profile Header */}
                                <div className="p-2 mb-2">
                                    <Link
                                        to={`/photographer/${user.id}`}
                                        className="flex items-center gap-3 p-2 hover:bg-base-content/5 rounded-lg transition-colors shadow-sm border border-base-content/5"
                                    >
                                        <div className="avatar">
                                            <div className="w-10 rounded-full">
                                                <img
                                                    src={profile?.avatar_url || user.user_metadata?.avatar_url || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}
                                                    alt="User"
                                                    className="avatar-img"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-bold text-lg leading-tight truncate">{profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0]}</span>
                                            <span className="text-xs opacity-50 font-medium truncate">@{profile?.username || user.user_metadata?.username || user.email?.split('@')[0]}</span>
                                        </div>
                                    </Link>
                                    <div className="divider my-1 opacity-20"></div>
                                </div>

                                {/* Menu Items */}
                                <ul className="space-y-1 px-2 pb-2">
                                    <li>
                                        <Link to="/settings" className="flex items-center justify-between py-3 hover:bg-base-content/5 rounded-lg active:bg-base-content/10">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-base-content/5 flex items-center justify-center">
                                                    <Settings size={20} />
                                                </div>
                                                <span className="font-medium text-base">Settings</span>
                                            </div>
                                        </Link>
                                    </li>
                                    <li>
                                        <button onClick={toggleTheme} className="flex items-center justify-between py-3 hover:bg-base-content/5 rounded-lg active:bg-base-content/10 w-full text-left">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-base-content/5 flex items-center justify-center">
                                                    <Moon size={20} />
                                                </div>
                                                <span className="font-medium text-base">
                                                    Dark Mode
                                                </span>
                                            </div>
                                            {theme === 'dark' ? (
                                                <div className="badge badge-sm badge-primary">On</div>
                                            ) : (
                                                <div className="badge badge-sm badge-ghost">Off</div>
                                            )}
                                        </button>
                                    </li>
                                    <li>
                                        <button onClick={handleSignOut} className="flex items-center justify-between py-3 hover:bg-base-content/5 rounded-lg active:bg-base-content/10 w-full text-left">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-base-content/5 flex items-center justify-center">
                                                    <LogOut size={20} />
                                                </div>
                                                <span className="font-medium text-base">Log out</span>
                                            </div>
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

