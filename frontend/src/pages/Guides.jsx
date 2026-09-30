import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Users, MapPin, Star, Globe, CalendarDays } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

export default function Guides() {
  const [searchParams] = useSearchParams()
  const destId = searchParams.get('destination_id')
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [bookingId, setBookingId] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['guides', destId],
    queryFn: () => {
      let url = '/guides?per_page=50'
      if (destId) url += `&destination_id=${destId}`
      return api.get(url).then(r => r.data)
    },
  })

  const handleBook = async (guide) => {
    if (!isAuthenticated) { navigate('/login'); return }
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
    setBookingId(guide.id)
    try {
      const res = await api.post('/bookings/guide', {
        guide_id: guide.id,
        date: tomorrow,
        time_slot: 'full-day',
      })
      toast.success('Guide booked!')
      navigate('/booking-confirmation', { state: { booking: res.data.booking } })
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Booking failed')
    } finally {
      setBookingId(null)
    }
  }

  return (
    <motion.div initial="hidden" animate="visible" transition={{ staggerChildren: 0.05 }} className="min-h-screen">
      <div className="py-10 px-4" style={{ background: 'linear-gradient(180deg, var(--color-surface-light), var(--color-surface))' }}>
        <div className="max-w-7xl mx-auto">
          <motion.h1 variants={fadeUp} className="text-3xl sm:text-4xl font-bold font-heading text-white mb-2">
            Travel <span className="gradient-text">Guides</span>
          </motion.h1>
          <motion.p variants={fadeUp} style={{ color: 'var(--color-text-muted)' }}>
            Expert local guides to make your trip unforgettable
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-72 rounded-xl" />)}
          </div>
        ) : data?.guides?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.guides.map((guide, i) => (
              <motion.div key={guide.id} variants={fadeUp} transition={{ delay: i * 0.04 }}>
                <div className="card p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
                      <img src={guide.image_url} alt={guide.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-lg truncate">{guide.name}</h3>
                      <p className="text-xs flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                        <MapPin size={12} /> {guide.destination_name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="badge badge-primary flex items-center gap-1 text-xs">
                          <Star size={10} fill="currentColor" /> {guide.rating}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>{guide.bio}</p>

                  {guide.languages?.length > 0 && (
                    <div className="flex items-center gap-1 mb-4 flex-wrap">
                      <Globe size={14} className="text-indigo-400" />
                      {guide.languages.map(lang => (
                        <span key={lang} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--color-surface)', color: 'var(--color-text-muted)' }}>
                          {lang}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <div>
                      <span className="text-xl font-bold text-white">${guide.price_per_day}</span>
                      <span className="text-xs ml-1" style={{ color: 'var(--color-text-dim)' }}>/day</span>
                    </div>
                    <button onClick={() => handleBook(guide)} disabled={bookingId === guide.id}
                      className="btn-primary text-sm" style={{ padding: '0.5rem 1.25rem', opacity: bookingId === guide.id ? 0.7 : 1 }}>
                      <CalendarDays size={14} /> {bookingId === guide.id ? 'Booking...' : 'Book Guide'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Users size={48} className="mx-auto mb-4 text-indigo-400 opacity-50" />
            <p style={{ color: 'var(--color-text-muted)' }}>No guides available at the moment.</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
