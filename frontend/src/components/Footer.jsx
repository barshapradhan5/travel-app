import { Link } from 'react-router-dom'
import { Plane, Mail, MapPin, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-light)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
                <Plane size={20} color="white" />
              </div>
              <span className="text-xl font-bold font-heading text-white">Wanderlust</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Your all-in-one platform for discovering and booking incredible travel experiences worldwide.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Explore</h4>
            <div className="space-y-2">
              {[{to:'/', label:'Home'}, {to:'/search', label:'Destinations'}, {to:'/tickets', label:'Tickets'}, {to:'/guides', label:'Travel Guides'}, {to:'/map', label:'Map'}].map(l => (
                <Link key={l.to} to={l.to} className="block text-sm no-underline" style={{ color: 'var(--color-text-muted)' }}>{l.label}</Link>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Company</h4>
            <div className="space-y-2">
              {[{to:'/about', label:'About Us'}, {to:'/contact', label:'Contact'}, {to:'/about', label:'Privacy Policy'}, {to:'/about', label:'Terms of Service'}].map((l, i) => (
                <Link key={i} to={l.to} className="block text-sm no-underline" style={{ color: 'var(--color-text-muted)' }}>{l.label}</Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Get in Touch</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <Mail size={14} className="text-indigo-400" /> hello@wanderlust.travel
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <Phone size={14} className="text-indigo-400" /> +1 (555) 123-4567
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <MapPin size={14} className="text-indigo-400" /> San Francisco, CA
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: 'var(--color-border)' }}>
          <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>© 2026 Wanderlust. All rights reserved.</p>
          <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>Crafted with ❤️ for travelers everywhere</p>
        </div>
      </div>
    </footer>
  )
}
