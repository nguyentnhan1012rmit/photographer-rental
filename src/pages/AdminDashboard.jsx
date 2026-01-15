import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { Trash2, Shield, ShieldOff, Search } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    const fetchUsers = useCallback(async () => {
        setLoading(true)
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .order('full_name') // sort by full_name

        if (data) setUsers(data)
        setLoading(false)
    }, [])

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            toast.error("Unauthorized Access")
            navigate('/')
            return
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchUsers()
    }, [user, navigate, fetchUsers])

    const handleDeleteUser = async (id) => {
        // Caution: Deleting from Auth is hard via client. We can only delete from public.profiles
        // which might Cascade if configured, or just leave auth orphan.
        // Real Admin delete usually requires Supabase Service Role Key (Backend).
        // For client-side simulation, we'll try standard delete on profile.

        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return

        const { error } = await supabase.from('profiles').delete().eq('id', id)

        if (error) {
            toast.error("Failed to delete user. (Requires Service Role usually)")
            console.error(error)
        } else {
            toast.success("User profile deleted.")
            fetchUsers()
        }
    }

    const handleToggleRole = async (userToEdit) => {
        const newRole = userToEdit.role === 'admin' ? 'customer' : 'admin' // Toggle admin status
        // Or if we want to simple promote to admin? Let's just have "Make Admin" / "Revoke Admin"

        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userToEdit.id)

        if (error) {
            toast.error("Failed to update role")
        } else {
            toast.success(`User is now ${newRole}`)
            fetchUsers()
        }
    }

    const filteredUsers = users.filter(u =>
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.location?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) return (
        <div className="flex justify-center p-12">
            <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
    )

    return (
        <div className="container mx-auto p-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-error">Super Admin Dashboard</h1>
                <div className="relative w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" size={18} />
                    <input
                        type="text"
                        className="input input-bordered pl-10 w-full md:w-64"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto bg-base-100 rounded-xl shadow border border-base-200">
                <table className="table">
                    <thead className="bg-base-200">
                        <tr>
                            <th>User</th>
                            <th>Role</th>
                            <th>Location</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(u => (
                            <tr key={u.id}>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="avatar">
                                            <div className="mask mask-squircle w-10 h-10">
                                                {u.avatar_url ? <img src={u.avatar_url} /> : <div className="bg-neutral w-full h-full"></div>}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="font-bold">{u.full_name}</div>
                                            <div className="text-sm opacity-50">{u.id.slice(0, 8)}...</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className={`badge ${u.role === 'admin' ? 'badge-error' :
                                        u.role === 'photographer' ? 'badge-secondary' : 'badge-ghost'
                                        }`}>
                                        {u.role}
                                    </div>
                                </td>
                                <td>{u.location || 'N/A'}</td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        {u.role !== 'admin' ? (
                                            <button
                                                onClick={() => handleToggleRole(u)}
                                                className="btn btn-xs btn-ghost text-success tooltip"
                                                data-tip="Promote to Admin"
                                            >
                                                <Shield size={16} />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleToggleRole(u)}
                                                className="btn btn-xs btn-ghost text-warning tooltip"
                                                data-tip="Revoke Admin"
                                            >
                                                <ShieldOff size={16} />
                                            </button>
                                        )}

                                        <button
                                            onClick={() => handleDeleteUser(u.id)}
                                            className="btn btn-xs btn-ghost text-error tooltip"
                                            data-tip="Delete User"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
