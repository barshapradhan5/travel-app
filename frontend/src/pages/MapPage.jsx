import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { MapPin, Hotel, Navigation } from 'lucide-react'
import api from '../services/api'

// Fix default Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const destIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
})

export default function MapPage() {
  const [points, setPoints] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/map/points')
      .then(res => setPoints(res.data.points))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen">
      <div className="py-6 px-4" style={{ background: 'var(--color-surface-light)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white">
              Explore the <span className="gradient-text">World</span>
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Click markers to discover destinations and hotels
            </p>
          </div>
          <div className="badge badge-primary">
            <Navigation size={14} className="mr-1" /> {points.length} locations
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="rounded-2xl overflow-hidden" style={{ height: '70vh', border: '1px solid var(--color-border)' }}>
          {loading ? (
            <div className="skeleton w-full h-full" />
          ) : (
            <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true} className="rounded-2xl">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              {points.map((point, i) => (
                <Marker key={`${point.type}-${point.id}-${i}`} position={[point.lat, point.lng]} icon={destIcon}>
                  <Popup>
                    <div style={{ minWidth: '180px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        {point.type === 'hotel' ? <Hotel size={14} color="#6366f1" /> : <MapPin size={14} color="#ec4899" />}
                        <strong style={{ fontSize: '14px' }}>{point.name}</strong>
                      </div>
                      <p style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>{point.summary}</p>
                      <Link to={point.link} style={{ fontSize: '12px', color: '#6366f1', fontWeight: 600 }}>
                        View Details →
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>
      </div>
    </motion.div>
  )
}
