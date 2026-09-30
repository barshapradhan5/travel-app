import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Hotel, Ticket, Users, CalendarDays, Clock, DollarSign } from 'lucide-react'
import api from '../services/api'

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

const typeConfig = {
  hotel: { icon: Hotel, label: 'Hotel Booking', color: '#6366f1' },
  ticket: { icon: Ticket, label: 'Ticket Booking', color: '#8b5cf6' },
  guide: { icon: Users, label: 'Guide Booking', color: '#ec4899' },
}

export default function MyBookings() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => api.get('/bookings/me').then(r => r.data),
  })

  const bookings = data?.bookings || []

  const getBookingDetails = (b) => {
    if (b.booking_type === 'hotel' && b.hotel_booking) {
      return {
        title: b.hotel_booking.hotel_name || 'Hotel',
        subtitle: `${b.hotel_booking.room_type || 'Room'} · ${b.hotel_booking.guests} guest(s)`,
        date: `${b.hotel_booking.check_in} → ${b.hotel_booking.check_out}`,
      }
    }
    if (b.booking_type === 'ticket' && b.ticket_booking) {
      return {
        title: b.ticket_booking.ticket_title || 'Ticket',
        subtitle: `Qty: ${b.ticket_booking.quantity}`,
        date: b.ticket_booking.travel_date,
      }
    }
    if (b.booking_type === 'guide' && b.guide_booking) {
      return {
        title: b.guide_booking.guide_name || 'Guide',
        subtitle: b.guide_booking.time_slot || 'Full day',
        date: b.guide_booking.date,
      }
    }
    return { title: 'Booking', subtitle: '', date: '' }
  }

  return (
    <motion.div initial="hidden" animate="visible" transition={{ staggerChildren: 0.05 }} className="min-h-screen">
      <div className="py-10 px-4" style={{ background: 'linear-gradient(180deg, var(--color-surface-light), var(--color-surface))' }}>
        <div className="max-w-4xl mx-auto">
          <motion.h1 variants={fadeUp} className="text-3xl sm:text-4xl font-bold font-heading text-white mb-2">
            My <span className="gradient-text">Bookings</span>
          </motion.h1>
          <motion.p variants={fadeUp} style={{ color: 'var(--color-text-muted)' }}>
            All your travel bookings in one place
          </motion.p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
          </div>
        ) : bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((b, i) => {
              const config = typeConfig[b.booking_type] || typeConfig.hotel
              const details = getBookingDetails(b)
              const Icon = config.icon

              return (
                <motion.div key={b.id} variants={fadeUp} transition={{ delay: i * 0.05 }}>
                  <div className="card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${config.color}15` }}>
                      <Icon size={22} style={{ color: config.color }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white truncate">{details.title}</h3>
                        <span className="badge badge-success text-xs">{b.status}</span>
                      </div>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{details.subtitle}</p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-dim)' }}>
                          <CalendarDays size={12} /> {details.date}
                        </span>
                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-dim)' }}>
                          <Clock size={12} /> {new Date(b.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1">
                        <DollarSign size={16} className="text-indigo-400" />
                        <span className="text-xl font-bold text-white">{b.total_price}</span>
                      </div>
                      <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{config.label}</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <CalendarDays size={48} className="mx-auto mb-4 text-indigo-400 opacity-50" />
            <h3 className="text-lg font-semibold text-white mb-2">No bookings yet</h3>
            <p style={{ color: 'var(--color-text-muted)' }}>Start exploring and book your first adventure!</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
