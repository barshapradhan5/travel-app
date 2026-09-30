import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Ticket as TicketIcon, MapPin, CalendarDays, Users, ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

export default function Tickets() {
  const [searchParams] = useSearchParams()
  const destId = searchParams.get('destination_id')
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [bookingId, setBookingId] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['tickets', destId],
    queryFn: () => {
      let url = '/tickets?per_page=50'
      if (destId) url += `&destination_id=${destId}`
      return api.get(url).then(r => r.data)
    },
  })

  const handleBook = async (ticket) => {
    if (!isAuthenticated) { navigate('/login'); return }
    const today = new Date().toISOString().split('T')[0]
    setBookingId(ticket.id)
    try {
      const res = await api.post('/bookings/ticket', {
        ticket_id: ticket.id,
        quantity: 1,
        travel_date: ticket.date || today,
      })
      toast.success('Ticket booked!')
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
            Travel <span className="gradient-text">Tickets</span>
          </motion.h1>
          <motion.p variants={fadeUp} style={{ color: 'var(--color-text-muted)' }}>
            Tours, transport, and attraction tickets for your next adventure
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-64 rounded-xl" />)}
          </div>
        ) : data?.tickets?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.tickets.map((ticket, i) => (
              <motion.div key={ticket.id} variants={fadeUp} transition={{ delay: i * 0.04 }}>
                <div className="card overflow-hidden">
                  <div className="relative h-40 overflow-hidden">
                    <img src={ticket.image_url} alt={ticket.title} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3">
                      <span className="badge" style={{
                        background: ticket.type === 'transport' ? 'rgba(99,102,241,0.9)' : 'rgba(168,85,247,0.9)',
                        color: 'white'
                      }}>
                        {ticket.type === 'transport' ? '🚌 Transport' : '🎟️ Attraction'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white mb-1">{ticket.title}</h3>
                    <p className="text-xs mb-3 flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                      <MapPin size={12} /> {ticket.destination_name}
                    </p>
                    <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>{ticket.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xl font-bold text-white">${ticket.price}</span>
                        <span className="text-xs ml-1" style={{ color: 'var(--color-text-dim)' }}>/person</span>
                      </div>
                      <button onClick={() => handleBook(ticket)} disabled={bookingId === ticket.id}
                        className="btn-primary text-sm" style={{ padding: '0.5rem 1rem', opacity: bookingId === ticket.id ? 0.7 : 1 }}>
                        <ShoppingCart size={14} /> {bookingId === ticket.id ? 'Booking...' : 'Book'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <TicketIcon size={48} className="mx-auto mb-4 text-indigo-400 opacity-50" />
            <p style={{ color: 'var(--color-text-muted)' }}>No tickets available at the moment.</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
