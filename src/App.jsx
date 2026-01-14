import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import PrivateRoute from './components/PrivateRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import PhotographerDashboard from './pages/PhotographerDashboard'
import Feed from './pages/Feed'
import Photographers from './pages/Photographers'
import PhotographerProfile from './pages/PhotographerProfile'
import MyBookings from './pages/MyBookings'
import ProfileSettings from './pages/ProfileSettings'
import AdminDashboard from './pages/AdminDashboard'
import Inbox from './pages/Inbox'
import PaymentPage from './pages/PaymentPage'
import './App.css'

const queryClient = new QueryClient()

import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#1a1b2e', // Accessing base-200 kind of color manually or just dark
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
              },
            }}
          />
          {/* Main Container: Full width, no extra margins/borders */}
          <div className="min-h-screen bg-base-100 font-sans text-base-content relative overflow-x-hidden selection:bg-primary selection:text-white">

            {/* Background glow effects - subtly placed behind content */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[50%] bg-primary/5 rounded-full blur-[150px] opacity-30"></div>
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[50%] bg-secondary/5 rounded-full blur-[150px] opacity-30"></div>
            </div>

            {/* Content Wrapper */}
            <div className="relative z-10 flex flex-col min-h-screen">
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />

                {/* Protected Routes */}
                <Route path="/feed" element={
                  <PrivateRoute>
                    <Feed />
                  </PrivateRoute>
                } />
                <Route path="/photographers" element={
                  <PrivateRoute>
                    <Photographers />
                  </PrivateRoute>
                } />
                <Route path="/photographer/:id" element={
                  <PrivateRoute>
                    <PhotographerProfile />
                  </PrivateRoute>
                } />
                <Route path="/dashboard" element={
                  <PrivateRoute>
                    <PhotographerDashboard />
                  </PrivateRoute>
                } />
                <Route path="/my-bookings" element={
                  <PrivateRoute>
                    <MyBookings />
                  </PrivateRoute>
                } />
                <Route path="/settings" element={
                  <PrivateRoute>
                    <ProfileSettings />
                  </PrivateRoute>
                } />
                <Route path="/admin" element={
                  <PrivateRoute>
                    <AdminDashboard />
                  </PrivateRoute>
                } />
                <Route path="/inbox" element={
                  <PrivateRoute>
                    <Inbox />
                  </PrivateRoute>
                } />
                <Route path="/payment" element={
                  <PrivateRoute>
                    <PaymentPage />
                  </PrivateRoute>
                } />
              </Routes>
            </div>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
