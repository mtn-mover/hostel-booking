'use client'

import { useState } from 'react'
import { Search, MapPin, Calendar, Users } from 'lucide-react'

interface FilterState {
  location: string
  checkIn: string
  checkOut: string
  guests: number
  priceRange: [number, number]
  bedrooms: number | null
}

export function SearchFilters() {
  const [filters, setFilters] = useState<FilterState>({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    priceRange: [0, 500],
    bedrooms: null
  })

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSearch = () => {
    // TODO: Implement search functionality
    console.log('Searching with filters:', filters)
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
      {/* Main Search Bar */}
      <div className="p-2">
        <div className="flex flex-col lg:flex-row lg:items-center">
          {/* Location Input */}
          <div className="flex-1 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
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
                  className="w-full text-sm text-gray-600 placeholder-gray-400 border-0 focus:outline-none focus:ring-0 p-0"
                />
              </div>
            </div>
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
                  className="w-full text-sm text-gray-600 border-0 focus:outline-none focus:ring-0 p-0"
                  placeholder="Add dates"
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
                  className="w-full text-sm text-gray-600 border-0 focus:outline-none focus:ring-0 p-0"
                  placeholder="Add dates"
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px h-12 bg-gray-200"></div>

          {/* Guests */}
          <div className="flex-1 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-900 mb-1">
                  Who
                </label>
                <select
                  value={filters.guests}
                  onChange={(e) => handleFilterChange('guests', parseInt(e.target.value))}
                  className="w-full text-sm text-gray-600 border-0 focus:outline-none focus:ring-0 p-0 bg-transparent cursor-pointer"
                >
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4 Guests</option>
                  <option value="5">5 Guests</option>
                  <option value="6">6+ Guests</option>
                </select>
              </div>
            </div>
          </div>

          {/* Search Button */}
          <div className="p-2">
            <button 
              onClick={handleSearch}
              className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white p-4 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Search className="w-5 h-5" />
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

            {/* Price Range */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range per Night: CHF {filters.priceRange[0]} - CHF {filters.priceRange[1]}
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={filters.priceRange[0]}
                  onChange={(e) => handleFilterChange('priceRange', [parseInt(e.target.value), filters.priceRange[1]])}
                  className="flex-1"
                />
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={filters.priceRange[1]}
                  onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value)])}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}