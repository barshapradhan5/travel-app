import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { MapPin, Star, Wifi, Waves, Dumbbell, Utensils, Sparkles, Users, CalendarDays, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const amenityIcons = {
  wifi: Wifi, pool: Waves, gym: Dumbbell, restaurant: Utensils, spa: Sparkles,
}

export default function HotelDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)
  const [booking, setBooking] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['hotel', id],
    queryFn: () => api.get(`/hotels/${id}`).then(r => r.data),
  })

  const hotel = data?.hotel

  const nights = checkIn && checkOut ? Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000)) : 0
  const totalPrice = selectedRoom ? selectedRoom.price * nights : 0

  const handleBook = async () => {
    if (!isAuthenticated) { navigate('/login', { state: { from: { pathname: `/hotels/${id}` } } }); return }
    if (!selectedRoom || !checkIn || !checkOut) { toast.error('Please select room, check-in and check-out dates'); return }

    setBooking(true)
    try {
      const res = await api.post('/bookings/hotel', {
        hotel_id: parseInt(id),
        room_id: selectedRoom.id,
        check_in: checkIn,
        check_out: checkOut,
        guests,
      })
      toast.success('Hotel booked successfully!')
      navigate('/booking-confirmation', { state: { booking: res.data.booking } })
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Booking failed')
    } finally {
      setBooking(false)
    }
  }

  if (isLoading) return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="skeleton h-80 rounded-2xl mb-6" />
      <div className="skeleton h-8 w-64 rounded-lg mb-4" />
      <div className="skeleton h-4 w-full rounded mb-2" />
      <div className="skeleton h-4 w-3/4 rounded" />
    </div>
  )

  if (!hotel) return <div className="text-center py-20" style={{ color: 'var(--color-text-muted)' }}>Hotel not found</div>

  const today = new Date().toISOString().split('T')[0]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Image */}
      <div className="relative h-64 sm:h-96 rounded-3xl overflow-hidden mb-8">
        <img src={hotel.image_url} alt={hotel.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent 50%)' }} />
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="badge badge-primary flex items-center gap-1"><Star size={12} fill="currentColor" /> {hotel.rating}</span>
            <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              <MapPin size={14} className="inline" /> {hotel.destination_name}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white font-heading">{hotel.name}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-xl font-bold text-white mb-3 font-heading">About this hotel</h2>
            <p style={{ color: 'var(--color-text-muted)' }}>{hotel.description}</p>
          </div>

          {/* Amenities */}
          {hotel.amenities?.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4 font-heading">Amenities</h2>
              <div className="flex flex-wrap gap-3">
                {hotel.amenities.map((a) => {
                  const Icon = amenityIcons[a] || Sparkles
                  return (
                    <div key={a} className="flex items-center gap-2 px-4 py-2 rounded-xl"
                      style={{ background: 'var(--color-surface-light)', border: '1px solid var(--color-border)' }}>
                      <Icon size={16} className="text-indigo-400" />
                      <span className="text-sm capitalize text-white">{a}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Rooms */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4 font-heading">Available Rooms</h2>
            <div className="space-y-3">
              {hotel.rooms?.map((room) => (
                <div key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className="flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all"
                  style={{
                    background: selectedRoom?.id === room.id ? 'rgba(99,102,241,0.1)' : 'var(--color-surface-light)',
                    border: `2px solid ${selectedRoom?.id === room.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  }}>
                  <div className="flex items-center gap-4">
                    {selectedRoom?.id === room.id && <Check size={20} className="text-indigo-400" />}
                    <div>
                      <h4 className="font-semibold text-white">{room.room_type}</h4>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        Up to {room.capacity} guests • {room.available_count} available
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-white">${room.price}</span>
                    <span className="text-xs block" style={{ color: 'var(--color-text-dim)' }}>/night</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Booking Card */}
        <div>
          <div className="glass rounded-2xl p-6 sticky top-24" style={{ boxShadow: 'var(--shadow-glow)' }}>
            <h3 className="text-lg font-bold text-white mb-1 font-heading">Book Your Stay</h3>
            <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>
              From <span className="text-xl font-bold text-white">${hotel.price_per_night}</span>/night
            </p>

            <div className="space-y-4">
              <div>
                <label className="input-label flex items-center gap-1"><CalendarDays size={14} /> Check-in</label>
                <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} min={today}
                  className="input-field" id="hotel-checkin" />
              </div>
              <div>
                <label className="input-label flex items-center gap-1"><CalendarDays size={14} /> Check-out</label>
                <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} min={checkIn || today}
                  className="input-field" id="hotel-checkout" />
              </div>
              <div>
                <label className="input-label flex items-center gap-1"><Users size={14} /> Guests</label>
                <input type="number" value={guests} onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                  min={1} max={10} className="input-field" id="hotel-guests" />
              </div>

              {selectedRoom && nights > 0 && (
                <div className="p-3 rounded-xl" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  <div className="flex justify-between text-sm mb-1">
                    <span style={{ color: 'var(--color-text-muted)' }}>{selectedRoom.room_type} × {nights} nights</span>
                    <span className="text-white">${totalPrice}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                    <span className="text-white">Total</span>
                    <span className="text-xl gradient-text">${totalPrice}</span>
                  </div>
                </div>
              )}

              <button onClick={handleBook} disabled={booking} className="btn-primary w-full" id="hotel-book-btn"
                style={{ opacity: booking ? 0.7 : 1 }}>
                {booking ? 'Booking...' : 'Book Now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
