import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Search from './pages/Search'
import HotelDetail from './pages/HotelDetail'
import Tickets from './pages/Tickets'
import Guides from './pages/Guides'
import MapPage from './pages/MapPage'
import About from './pages/About'
import Contact from './pages/Contact'
import MyBookings from './pages/MyBookings'
import BookingConfirmation from './pages/BookingConfirmation'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/search" element={<Search />} />
            <Route path="/hotels/:id" element={<HotelDetail />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/guides" element={<Guides />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
            <Route path="/booking-confirmation" element={<ProtectedRoute><BookingConfirmation /></ProtectedRoute>} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}
