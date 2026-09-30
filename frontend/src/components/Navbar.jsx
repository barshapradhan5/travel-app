import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Plane, User, LogOut, BookOpen } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const links = [
    { to: '/', label: 'Home' },
    { to: '/search', label: 'Explore' },
    { to: '/tickets', label: 'Tickets' },
    { to: '/guides', label: 'Guides' },
    { to: '/map', label: 'Map' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 glass" style={{ borderBottom: '1px solid var(--color-border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 no-underline">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
              <Plane size={20} color="white" />
            </div>
            <span className="text-xl font-bold font-heading text-white">Wanderlust</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all no-underline"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/my-bookings" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all no-underline">
                  <BookOpen size={16} /> My Bookings
                </Link>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(99,102,241,0.1)' }}>
                  <User size={16} className="text-indigo-400" />
                  <span className="text-sm font-medium text-indigo-300">{user?.name}</span>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 transition-all cursor-pointer bg-transparent border-none">
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 rounded-full text-sm font-medium text-slate-300 hover:text-white transition-all no-underline">
                  Sign In
                </Link>
                <Link to="/signup" className="btn-primary text-sm no-underline" style={{ padding: '0.5rem 1.25rem' }}>
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden text-white bg-transparent border-none cursor-pointer" onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden"
            style={{ borderTop: '1px solid var(--color-border)' }}
          >
            <div className="px-4 py-4 space-y-1">
              {links.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 no-underline">
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 mt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                {isAuthenticated ? (
                  <>
                    <Link to="/my-bookings" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 no-underline">My Bookings</Link>
                    <button onClick={() => { handleLogout(); setOpen(false) }} className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-400 bg-transparent border-none cursor-pointer">Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 no-underline">Sign In</Link>
                    <Link to="/signup" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-indigo-400 no-underline">Get Started</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
