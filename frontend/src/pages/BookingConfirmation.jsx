import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, ArrowRight, CalendarDays, DollarSign } from 'lucide-react'

export default function BookingConfirmation() {
  const location = useLocation()
  const booking = location.state?.booking

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen flex items-center justify-center px-4 py-16"
    >
      <div className="glass rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center" style={{ boxShadow: '0 0 80px rgba(34,197,94,0.1)' }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        >
          <CheckCircle size={72} className="mx-auto mb-6" style={{ color: 'var(--color-success)' }} />
        </motion.div>

        <h1 className="text-3xl font-bold font-heading text-white mb-2">Booking Confirmed!</h1>
        <p className="text-base mb-8" style={{ color: 'var(--color-text-muted)' }}>
          Your booking has been successfully placed. We're excited for your upcoming trip!
        </p>

        {booking && (
          <div className="rounded-xl p-5 mb-8 text-left space-y-3"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Booking ID</span>
              <span className="text-sm font-mono font-semibold text-white">#{booking.id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Type</span>
              <span className="badge badge-primary capitalize">{booking.booking_type}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Status</span>
              <span className="badge badge-success capitalize">{booking.status}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <span className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                <DollarSign size={14} className="inline" /> Total
              </span>
              <span className="text-xl font-bold gradient-text">${booking.total_price}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/my-bookings" className="btn-primary no-underline">
            View My Bookings <ArrowRight size={16} />
          </Link>
          <Link to="/" className="btn-secondary no-underline">
            Back to Home
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
