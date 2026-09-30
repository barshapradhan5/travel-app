import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Search as SearchIcon, MapPin, Star, SlidersHorizontal, X } from 'lucide-react'
import api from '../services/api'

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('query') || '')
  const [priceMax, setPriceMax] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const searchQuery = searchParams.get('query') || ''
  const page = parseInt(searchParams.get('page') || '1')

  const { data: destData, isLoading: destLoading } = useQuery({
    queryKey: ['destinations', searchQuery, page],
    queryFn: () => api.get(`/destinations?query=${encodeURIComponent(searchQuery)}&page=${page}&per_page=12`).then(r => r.data),
  })

  const { data: hotelData, isLoading: hotelLoading } = useQuery({
    queryKey: ['hotels-search', searchQuery, priceMax, page],
    queryFn: () => {
      let url = `/hotels?page=${page}&per_page=12`
      if (priceMax) url += `&price_max=${priceMax}`
      return api.get(url).then(r => r.data)
    },
  })

  const handleSearch = (e) => {
    e.preventDefault()
    setSearchParams({ query, page: '1' })
  }

  return (
    <motion.div initial="hidden" animate="visible" transition={{ staggerChildren: 0.05 }} className="min-h-screen">
      {/* Header */}
      <div className="py-10 px-4" style={{ background: 'linear-gradient(180deg, var(--color-surface-light) 0%, var(--color-surface) 100%)' }}>
        <div className="max-w-7xl mx-auto">
          <motion.h1 variants={fadeUp} className="text-3xl sm:text-4xl font-bold font-heading text-white mb-2">
            Explore <span className="gradient-text">Destinations</span>
          </motion.h1>
          <motion.p variants={fadeUp} style={{ color: 'var(--color-text-muted)' }} className="mb-6">
            {searchQuery ? `Showing results for "${searchQuery}"` : 'Browse all destinations and hotels'}
          </motion.p>

          <motion.form variants={fadeUp} onSubmit={handleSearch} className="flex gap-3 max-w-2xl">
            <div className="flex-1 flex items-center gap-2 px-4 rounded-xl" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <SearchIcon size={18} className="text-indigo-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search destinations, cities..."
                className="flex-1 bg-transparent border-none outline-none text-white py-3 placeholder-slate-500" />
            </div>
            <button type="submit" className="btn-primary">Search</button>
            <button type="button" onClick={() => setShowFilters(!showFilters)}
              className="p-3 rounded-xl border cursor-pointer bg-transparent transition-colors hover:bg-white/5"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
              {showFilters ? <X size={20} /> : <SlidersHorizontal size={20} />}
            </button>
          </motion.form>

          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              className="mt-4 p-4 rounded-xl" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="input-label">Max Price ($/night)</label>
                  <input type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)}
                    placeholder="e.g. 300" className="input-field" style={{ width: '160px' }} />
                </div>
                <button onClick={() => { setPriceMax(''); setShowFilters(false) }}
                  className="text-sm text-indigo-400 cursor-pointer bg-transparent border-none">Clear filters</button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Destinations */}
        {destData?.destinations?.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold text-white mb-6 font-heading">Destinations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {destData.destinations.map((dest, i) => (
                <motion.div key={dest.id} variants={fadeUp} transition={{ delay: i * 0.05 }}>
                  <Link to={`/search?query=${encodeURIComponent(dest.name)}`} className="card group block no-underline">
                    <div className="relative h-44 overflow-hidden">
                      <img src={dest.image_url} alt={dest.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent 60%)' }} />
                      <div className="absolute bottom-3 left-4">
                        <div className="flex items-center gap-1 text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}><MapPin size={12} /> {dest.country}</div>
                        <h3 className="text-white font-bold text-lg">{dest.name}</h3>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Hotels */}
        <section>
          <h2 className="text-xl font-bold text-white mb-6 font-heading">Hotels</h2>
          {hotelLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton h-72 rounded-xl" />
              ))}
            </div>
          ) : hotelData?.hotels?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotelData.hotels.map((hotel, i) => (
                <motion.div key={hotel.id} variants={fadeUp} transition={{ delay: i * 0.05 }}>
                  <Link to={`/hotels/${hotel.id}`} className="card group block no-underline">
                    <div className="relative h-44 overflow-hidden">
                      <img src={hotel.image_url} alt={hotel.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute top-3 right-3 badge badge-primary flex items-center gap-1">
                        <Star size={12} fill="currentColor" /> {hotel.rating}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-semibold mb-1">{hotel.name}</h3>
                      <p className="text-xs mb-3 flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                        <MapPin size={12} /> {hotel.destination_name}
                      </p>
                      <div className="flex items-end justify-between">
                        <div>
                          <span className="text-xl font-bold text-white">${hotel.price_per_night}</span>
                          <span className="text-xs ml-1" style={{ color: 'var(--color-text-dim)' }}>/night</span>
                        </div>
                        <span className="text-sm font-medium text-indigo-400">View Details →</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p style={{ color: 'var(--color-text-muted)' }}>No hotels found. Try adjusting your search.</p>
            </div>
          )}

          {/* Pagination */}
          {hotelData?.pages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {[...Array(hotelData.pages)].map((_, i) => (
                <button key={i} onClick={() => setSearchParams({ query: searchQuery, page: String(i + 1) })}
                  className="w-10 h-10 rounded-lg font-medium text-sm cursor-pointer border-none transition-all"
                  style={{
                    background: page === i + 1 ? 'var(--gradient-primary)' : 'var(--color-surface-light)',
                    color: page === i + 1 ? 'white' : 'var(--color-text-muted)',
                  }}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </motion.div>
  )
}
