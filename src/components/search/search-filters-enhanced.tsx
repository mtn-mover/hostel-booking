'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, MapPin, Calendar, Users, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface FilterState {
  location: string
  checkIn: string
  checkOut: string
  guests: number
  bedrooms: number | null
  sortBy: string
}

// Available locations - currently only Interlaken
const POPULAR_DESTINATIONS = [
  { city: 'Interlaken', country: 'Switzerland', icon: '🏔️', available: true },
  // Coming soon locations (disabled for now)
  { city: 'Zurich', country: 'Switzerland', icon: '🏙️', available: false },
  { city: 'Geneva', country: 'Switzerland', icon: '🌊', available: false },
  { city: 'Lucerne', country: 'Switzerland', icon: '🌉', available: false },
  { city: 'Bern', country: 'Switzerland', icon: '🏛️', available: false },
  { city: 'Basel', country: 'Switzerland', icon: '🎨', available: false },
  { city: 'Lausanne', country: 'Switzerland', icon: '🍷', available: false },
  { city: 'Zermatt', country: 'Switzerland', icon: '⛷️', available: false },
]

export function SearchFiltersEnhanced() {
  const router = useRouter()
  const [filters, setFilters] = useState<FilterState>({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    bedrooms: null,
    sortBy: 'recommended'
  })

  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [showGuestsDropdown, setShowGuestsDropdown] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  
  const locationRef = useRef<HTMLDivElement>(null)
  const guestsRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false)
      }
      if (guestsRef.current && !guestsRef.current.contains(event.target as Node)) {
        setShowGuestsDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleLocationSelect = (city: string, available: boolean) => {
    if (available) {
      handleFilterChange('location', city)
      setShowLocationDropdown(false)
    }
  }

  const handleGuestsChange = (type: 'adults' | 'children', increment: boolean) => {
    if (type === 'adults') {
      const newValue = increment ? adults + 1 : Math.max(1, adults - 1)
      setAdults(newValue)
      handleFilterChange('guests', newValue + children)
    } else {
      const newValue = increment ? children + 1 : Math.max(0, children - 1)
      setChildren(newValue)
      handleFilterChange('guests', adults + newValue)
    }
  }

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (filters.location) params.append('location', filters.location)
    if (filters.checkIn) params.append('checkIn', filters.checkIn)
    if (filters.checkOut) params.append('checkOut', filters.checkOut)
    if (filters.guests > 1) params.append('guests', filters.guests.toString())
    if (filters.bedrooms) params.append('bedrooms', filters.bedrooms.toString())
    
    router.push(`/apartments?${params.toString()}`)
  }

  const filteredDestinations = POPULAR_DESTINATIONS.filter(dest =>
    dest.city.toLowerCase().includes(filters.location.toLowerCase()) ||
    dest.country.toLowerCase().includes(filters.location.toLowerCase())
  )

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
      {/* Main Search Bar */}
      <div className="p-2">
        <div className="flex flex-col lg:flex-row lg:items-center">
          {/* Location Input */}
          <div ref={locationRef} className="flex-1 relative">
            <div 
              className="p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors"
              onClick={() => setShowLocationDropdown(true)}
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-900 mb-1">
                    Where
                  </label>
                  <input
                    type="text"
                    placeholder="Search destinations"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    onFocus={() => setShowLocationDropdown(true)}
                    className="w-full text-sm text-gray-600 placeholder-gray-400 border-0 focus:outline-none focus:ring-0 p-0"
                  />
                </div>
                {filters.location && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleFilterChange('location', '')
                    }}
                    className="p-1 hover:bg-gray-200 rounded-full"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                )}
              </div>
            </div>

            {/* Location Dropdown */}
            {showLocationDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-80 overflow-y-auto">
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Available destinations</h3>
                  <div className="grid gap-2">
                    {filteredDestinations.map((dest) => (
                      <button
                        key={dest.city}
                        onClick={() => handleLocationSelect(dest.city, dest.available)}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                          dest.available 
                            ? 'hover:bg-gray-50 cursor-pointer' 
                            : 'opacity-50 cursor-not-allowed'
                        }`}
                        disabled={!dest.available}
                      >
                        <span className="text-2xl">{dest.icon}</span>
                        <div>
                          <div className="font-medium text-gray-900">
                            {dest.city}
                            {!dest.available && <span className="ml-2 text-xs text-gray-500">(Coming soon)</span>}
                          </div>
                          <div className="text-sm text-gray-500">{dest.country}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px h-12 bg-gray-200"></div>

          {/* Check-in */}
          <div className="flex-1 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-900 mb-1">
                  Check in
                </label>
                <input
                  type="date"
                  value={filters.checkIn}
                  onChange={(e) => handleFilterChange('checkIn', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full text-sm text-gray-600 border-0 focus:outline-none focus:ring-0 p-0"
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px h-12 bg-gray-200"></div>

          {/* Check-out */}
          <div className="flex-1 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-900 mb-1">
                  Check out
                </label>
                <input
                  type="date"
                  value={filters.checkOut}
                  onChange={(e) => handleFilterChange('checkOut', e.target.value)}
                  min={filters.checkIn || new Date().toISOString().split('T')[0]}
                  className="w-full text-sm text-gray-600 border-0 focus:outline-none focus:ring-0 p-0"
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px h-12 bg-gray-200"></div>

          {/* Guests */}
          <div ref={guestsRef} className="flex-1 relative">
            <div 
              className="p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors"
              onClick={() => setShowGuestsDropdown(!showGuestsDropdown)}
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-900 mb-1">
                    Who
                  </label>
                  <div className="text-sm text-gray-600">
                    {filters.guests} {filters.guests === 1 ? 'Guest' : 'Guests'}
                  </div>
                </div>
              </div>
            </div>

            {/* Guests Dropdown */}
            {showGuestsDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 p-4 min-w-[280px]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Adults</div>
                      <div className="text-sm text-gray-500">Ages 13 or above</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleGuestsChange('adults', false)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-colors"
                        disabled={adults <= 1}
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{adults}</span>
                      <button
                        onClick={() => handleGuestsChange('adults', true)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Children</div>
                      <div className="text-sm text-gray-500">Ages 2-12</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleGuestsChange('children', false)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-colors"
                        disabled={children <= 0}
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{children}</span>
                      <button
                        onClick={() => handleGuestsChange('children', true)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Search Button */}
          <div className="p-2">
            <button 
              onClick={handleSearch}
              className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white p-4 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              <span className="hidden xl:block pr-2 font-medium">Search</span>
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <div className="px-6 pb-2">
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          {showAdvancedFilters ? 'Hide' : 'Show'} advanced filters
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="border-t border-gray-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Bedrooms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bedrooms
              </label>
              <select
                value={filters.bedrooms || ''}
                onChange={(e) => handleFilterChange('bedrooms', e.target.value ? parseInt(e.target.value) : null)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              >
                <option value="">Any</option>
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Bedroom' : 'Bedrooms'}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort by
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              >
                <option value="recommended">Recommended</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Best Rating</option>
                <option value="size">Largest First</option>
                <option value="newest">Newest Listings</option>
              </select>
            </div>

            {/* Additional Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              >
                <option value="">All Types</option>
                <option value="apartment">Apartment</option>
                <option value="studio">Studio</option>
                <option value="loft">Loft</option>
                <option value="suite">Suite</option>
              </select>
            </div>
          </div>

          {/* Filter Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-full text-sm hover:border-gray-900 transition-colors">
              Free cancellation
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-full text-sm hover:border-gray-900 transition-colors">
              Kitchen
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-full text-sm hover:border-gray-900 transition-colors">
              Washing machine
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-full text-sm hover:border-gray-900 transition-colors">
              WiFi
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-full text-sm hover:border-gray-900 transition-colors">
              Parking
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-full text-sm hover:border-gray-900 transition-colors">
              Air conditioning
            </button>
          </div>
        </div>
      )}
    </div>
  )
}