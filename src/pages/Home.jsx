import { Link } from 'react-router-dom'
import { Camera, Users, Shield, Star, CheckCircle2 } from 'lucide-react'

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen bg-base-100 overflow-x-hidden">

            {/* Hero Section - Split Layout */}
            <section className="relative w-full pt-20 pb-32 px-6 md:px-20 lg:px-32">
                {/* Background elements */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent -z-10 blur-[100px] opacity-40"></div>

                <div className="max-w-[1920px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="text-left space-y-8">

                        <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-white leading-[1.1]">
                            Capture Life's <br />
                            <span className="text-primary">Perfect Moments</span>
                        </h1>

                        <p className="text-xl text-base-content/70 max-w-xl leading-relaxed">
                            Stop searching endlessly. Connect with top-tier professionals or find your next booking in seconds.
                        </p>

                        <div className="flex flex-wrap gap-4 pt-4">
                            <Link to="/photographers" className="btn btn-primary btn-xl rounded-full px-8 text-lg hover:scale-105 transition-transform">
                                Find a Photographer
                            </Link>
                            <Link to="/signup" className="btn btn-ghost btn-xl rounded-full px-8 text-lg hover:bg-white/5">
                                Join as a Pro →
                            </Link>
                        </div>

                        <div className="flex items-center gap-8 pt-8 opacity-60">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={20} className="text-primary" /> Verified Pros
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={20} className="text-primary" /> No Hidden Fees
                            </div>
                        </div>
                    </div>

                    {/* Right Side Visual (Mockup/Abstract) */}
                    <div className="relative hidden lg:block h-[600px] bg-gradient-to-br from-base-200 to-base-300 rounded-[2.5rem] border border-white/5 p-8 transform rotate-1 hover:rotate-0 transition-transform duration-700 ease-out">
                        {/* Abstract content representation */}
                        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px] rounded-[2.5rem]"></div>
                        <div className="h-full w-full bg-base-100 rounded-3xl shadow-2xl border border-white/5 flex flex-col overflow-hidden relative">
                            {/* Fake UI Header */}
                            <div className="h-16 border-b border-white/5 flex items-center px-6 gap-4">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
                                </div>
                            </div>
                            {/* Fake UI Body */}
                            <div className="p-8 space-y-6">
                                <div className="flex gap-4 items-center">
                                    <div className="w-16 h-16 rounded-full bg-primary/20"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 w-48 bg-white/10 rounded"></div>
                                        <div className="h-3 w-32 bg-white/5 rounded"></div>
                                    </div>
                                </div>
                                <div className="h-64 w-full bg-base-200 rounded-xl"></div>
                                <div className="flex gap-4">
                                    <div className="h-10 w-24 bg-primary/20 rounded-lg"></div>
                                    <div className="h-10 w-24 bg-white/5 rounded-lg"></div>
                                </div>
                            </div>

                            {/* Floating Badge */}
                            <div className="absolute bottom-12 right-12 bg-base-100/80 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/10 flex items-center gap-4 animate-bounce-slow">
                                <div className="bg-green-500/20 text-green-400 p-3 rounded-xl">
                                    <CheckCircle2 size={24} />
                                </div>
                                <div>
                                    <div className="text-sm opacity-60">Booking Confirmed</div>
                                    <div className="font-bold">Wed, 24th Jan</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Simple Process Section */}
            <section className="py-32 border-t border-white/5">
                <div className="max-w-[1920px] mx-auto px-6 md:px-20 lg:px-32 text-center">
                    <p className="text-primary font-medium tracking-wider uppercase mb-4">How it works</p>
                    <h2 className="text-4xl md:text-5xl font-bold mb-20">Just 3 steps to perfect shots</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line */}
                        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0"></div>

                        <div className="relative z-10 flex flex-col items-center group">
                            <div className="w-24 h-24 rounded-full bg-base-100 border border-white/10 flex items-center justify-center text-3xl font-bold mb-8 shadow-2xl group-hover:scale-110 transition-transform duration-500">
                                1
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Find a Pro</h3>
                            <p className="text-base-content/60 max-w-xs leading-relaxed">Search via our curated feed or browse portfolios to find your style match.</p>
                        </div>

                        <div className="relative z-10 flex flex-col items-center group">
                            <div className="w-24 h-24 rounded-full bg-base-100 border border-white/10 flex items-center justify-center text-3xl font-bold mb-8 shadow-2xl group-hover:scale-110 transition-transform duration-500">
                                2
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Book & Shoot</h3>
                            <p className="text-base-content/60 max-w-xs leading-relaxed">Secure your date and let the professional capture your magic moments.</p>
                        </div>

                        <div className="relative z-10 flex flex-col items-center group">
                            <div className="w-24 h-24 rounded-full bg-base-100 border border-white/10 flex items-center justify-center text-3xl font-bold mb-8 shadow-2xl group-hover:scale-110 transition-transform duration-500">
                                3
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Get Results</h3>
                            <p className="text-base-content/60 max-w-xs leading-relaxed">Receive high-quality edited photos directly through our secure platform.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Minimal Feature List */}
            <section className="py-32 bg-base-200/30">
                <div className="max-w-[1920px] mx-auto px-6 md:px-20 lg:px-32">
                    <div className="grid md:grid-cols-2 gap-24 items-center">
                        <div className="order-2 md:order-1 relative">
                            {/* Abstract Decorative blob */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/20 blur-[100px] rounded-full -z-10"></div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-6 mt-12">
                                    <div className="bg-base-100 p-8 rounded-3xl border border-white/5 h-64 w-full"></div>
                                    <div className="bg-base-100 p-8 rounded-3xl border border-white/5 h-48 w-full bg-gradient-to-br from-primary/20 to-base-100"></div>
                                </div>
                                <div className="space-y-6">
                                    <div className="bg-base-100 p-8 rounded-3xl border border-white/5 h-48 w-full bg-gradient-to-bl from-secondary/20 to-base-100"></div>
                                    <div className="bg-base-100 p-8 rounded-3xl border border-white/5 h-64 w-full"></div>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 md:order-2 space-y-8">
                            <h2 className="text-5xl font-bold leading-tight">Everything you need <br />in one place.</h2>
                            <p className="text-xl text-base-content/60">We handle the boring stuff so you can focus on the art.</p>

                            <ul className="space-y-6 pt-4">
                                <li className="flex items-center gap-4 text-xl">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary"><Camera size={20} /></div>
                                    Verified Portfolios
                                </li>
                                <li className="flex items-center gap-4 text-xl">
                                    <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary"><Shield size={20} /></div>
                                    Secure Payments
                                </li>
                                <li className="flex items-center gap-4 text-xl">
                                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent"><Users size={20} /></div>
                                    Community Feed
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer items-center p-12 bg-base-100 text-base-content border-t border-white/5 mt-auto">
                <aside className="items-center grid-flow-col">
                    <div className="text-2xl font-bold tracking-tight text-white pr-6 border-r border-white/10">LensLocker</div>
                    <p className="pl-6 opacity-60">Copyright © 2026 - All right reserved</p>
                </aside>
                <nav className="grid-flow-col gap-8 md:place-self-center md:justify-self-end text-base opacity-60">
                    <Link to="#" className="hover:text-primary transition-colors">Terms</Link>
                    <Link to="#" className="hover:text-primary transition-colors">Privacy</Link>
                    <Link to="#" className="hover:text-primary transition-colors">Contact</Link>
                </nav>
            </footer>
        </div>
    )
}
