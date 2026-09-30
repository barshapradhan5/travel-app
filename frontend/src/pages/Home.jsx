import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Search, MapPin, Hotel, Ticket, Users, ArrowRight, Star, ChevronRight } from 'lucide-react'
import api from '../services/api'

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const { data: destData } = useQuery({
    queryKey: ['featured-destinations'],
    queryFn: () => api.get('/destinations?per_page=6').then(r => r.data),
  })

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) navigate(`/search?query=${encodeURIComponent(searchQuery)}`)
  }

  const quickLinks = [
    { icon: Hotel, label: 'Hotels', desc: 'Find perfect stays', to: '/search', color: '#6366f1' },
    { icon: Ticket, label: 'Tickets', desc: 'Tours & transport', to: '/tickets', color: '#8b5cf6' },
    { icon: Users, label: 'Guides', desc: 'Local experts', to: '/guides', color: '#a855f7' },
    { icon: MapPin, label: 'Map', desc: 'Explore visually', to: '/map', color: '#ec4899' },
  ]

  return (
    <motion.div initial="hidden" animate="visible" transition={{ staggerChildren: 0.1 }}>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: 'var(--gradient-hero)', minHeight: '85vh', display: 'flex', alignItems: 'center' }}>
        {/* Decorative blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-20 blur-3xl" style={{ background: '#6366f1' }} />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: '#ec4899' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div variants={fadeUp} transition={{ duration: 0.7 }}>
            <span className="badge badge-primary mb-6 text-sm">✈️ Your Adventure Starts Here</span>
          </motion.div>

          <motion.h1 variants={fadeUp} transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold mb-6 leading-tight font-heading">
            Discover the World's <br />
            <span className="gradient-text">Most Beautiful Places</span>
          </motion.h1>

          <motion.p variants={fadeUp} transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg sm:text-xl max-w-2xl mx-auto mb-10" style={{ color: 'var(--color-text-muted)' }}>
            Search destinations, book hotels, grab tickets, and hire local guides — all in one seamless platform.
          </motion.p>

          {/* Search Bar */}
          <motion.form variants={fadeUp} transition={{ duration: 0.7, delay: 0.3 }}
            onSubmit={handleSearch}
            className="glass rounded-full max-w-2xl mx-auto flex items-center p-2"
            style={{ boxShadow: '0 0 60px rgba(99,102,241,0.2)' }}>
            <div className="flex items-center gap-3 flex-1 px-4">
              <Search size={20} className="text-indigo-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Where do you want to go?"
                className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder-slate-400"
                id="hero-search-input"
              />
            </div>
            <button type="submit" className="btn-primary rounded-full" style={{ padding: '0.75rem 2rem' }}>
              <Search size={18} /> Search
            </button>
          </motion.form>

          {/* Stats */}
          <motion.div variants={fadeUp} transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-8 mt-12">
            {[
              { value: '10+', label: 'Destinations' },
              { value: '25+', label: 'Hotels' },
              { value: '50+', label: 'Experiences' },
              { value: '30+', label: 'Expert Guides' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold gradient-text">{stat.value}</div>
                <div className="text-xs sm:text-sm" style={{ color: 'var(--color-text-muted)' }}>{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 mb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickLinks.map((item, i) => (
            <motion.div key={item.label} variants={fadeUp} transition={{ duration: 0.5, delay: i * 0.1 }}>
              <Link to={item.to} className="card p-6 flex flex-col items-center text-center group no-underline">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                  style={{ background: `${item.color}20` }}>
                  <item.icon size={26} style={{ color: item.color }} />
                </div>
                <h3 className="text-white font-semibold text-base mb-1">{item.label}</h3>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{item.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div variants={fadeUp} className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white mb-2">
              Featured <span className="gradient-text">Destinations</span>
            </h2>
            <p style={{ color: 'var(--color-text-muted)' }}>Handpicked places for unforgettable journeys</p>
          </div>
          <Link to="/search" className="hidden sm:flex items-center gap-1 text-sm font-medium text-indigo-400 hover:text-indigo-300 no-underline">
            View All <ChevronRight size={16} />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destData?.destinations?.map((dest, i) => (
            <motion.div key={dest.id} variants={fadeUp} transition={{ duration: 0.5, delay: i * 0.08 }}>
              <Link to={`/search?query=${encodeURIComponent(dest.name)}`} className="card group block no-underline">
                <div className="relative h-52 overflow-hidden">
                  <img src={dest.image_url} alt={dest.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-1 text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                      <MapPin size={12} /> {dest.country}
                    </div>
                    <h3 className="text-white text-lg font-bold">{dest.name}</h3>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>{dest.description}</p>
                  <div className="flex items-center gap-1 mt-3 text-sm font-medium text-indigo-400">
                    Explore <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div variants={fadeUp}
          className="glass rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 blur-3xl" style={{ background: '#6366f1' }} />
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white mb-4">
            Ready to Start Your <span className="gradient-text">Journey</span>?
          </h2>
          <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: 'var(--color-text-muted)' }}>
            Join thousands of travelers who trust Wanderlust for their adventures.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/signup" className="btn-primary no-underline">
              Create Free Account <ArrowRight size={18} />
            </Link>
            <Link to="/search" className="btn-secondary no-underline">
              Browse Destinations
            </Link>
          </div>
        </motion.div>
      </section>
    </motion.div>
  )
}
