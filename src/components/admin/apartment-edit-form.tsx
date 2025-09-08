'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RoomImageManager } from './room-image-manager'
import { PricingManager } from './pricing-manager'
import { Save, Loader2, AlertCircle } from 'lucide-react'

interface ApartmentData {
  id: string
  title: string
  name?: string | null
  description: string
  shortDescription?: string | null
  maxGuests: number
  bedrooms: number
  beds: number
  bathrooms: number
  size?: number | null
  price: number
  cleaningFee: number
  minStayNights: number
  maxStayNights?: number | null
  address?: string | null
  city: string
  country: string
  isActive: boolean
  airbnbId?: string | null
  airbnbUrl?: string | null
  apartmentImages: any[]
  apartmentAmenities: any[]
}

interface Props {
  apartment: ApartmentData
  amenities: any[]
  roomCategories: any[]
}

export function ApartmentEditForm({ apartment, amenities, roomCategories }: Props) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [savingSection, setSavingSection] = useState<string | null>(null)
  const [sectionSuccess, setSectionSuccess] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    title: apartment.title || apartment.name || '',
    description: apartment.description || '',
    shortDescription: apartment.shortDescription || '',
    maxGuests: apartment.maxGuests,
    bedrooms: apartment.bedrooms,
    beds: apartment.beds,
    bathrooms: apartment.bathrooms,
    size: apartment.size || 0,
    price: apartment.price,
    cleaningFee: apartment.cleaningFee,
    minStayNights: apartment.minStayNights,
    maxStayNights: apartment.maxStayNights || 0,
    address: apartment.address || '',
    city: apartment.city,
    country: apartment.country,
    isActive: apartment.isActive,
    airbnbId: apartment.airbnbId || '',
    airbnbUrl: apartment.airbnbUrl || '',
    bookingHorizon: apartment.bookingHorizon || '2026-12-31'
  })

  // Selected amenities
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    apartment.apartmentAmenities.map(aa => aa.amenityId)
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities(prev => {
      if (prev.includes(amenityId)) {
        return prev.filter(id => id !== amenityId)
      }
      return [...prev, amenityId]
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch(`/api/admin/apartments/${apartment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amenityIds: selectedAmenities
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update apartment')
      }

      setSuccess(true)
      setTimeout(() => {
        router.refresh()
        setSuccess(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleActive = async () => {
    try {
      const response = await fetch(`/api/admin/apartments/${apartment.id}/toggle-active`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !formData.isActive })
      })

      if (response.ok) {
        setFormData(prev => ({ ...prev, isActive: !prev.isActive }))
        router.refresh()
      }
    } catch (error) {
      console.error('Toggle active error:', error)
    }
  }

  // Save specific section
  const saveSection = async (section: string) => {
    setSavingSection(section)
    setSectionSuccess(null)
    setError(null)

    try {
      // Always send all form data to prevent nullifying other fields
      const dataToSave = {
        ...formData,
        amenityIds: section === 'amenities' ? selectedAmenities : undefined
      }

      const response = await fetch(`/api/admin/apartments/${apartment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave)
      })

      if (!response.ok) {
        throw new Error(`Failed to save ${section}`)
      }

      setSectionSuccess(section)
      setTimeout(() => {
        setSectionSuccess(null)
      }, 3000)
      
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSavingSection(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Apartment updated successfully!
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Short Description
                  </label>
                  <input
                    type="text"
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief tagline for listings"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Guests *
                    </label>
                    <input
                      type="number"
                      name="maxGuests"
                      value={formData.maxGuests}
                      onChange={handleInputChange}
                      required
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bedrooms *
                    </label>
                    <input
                      type="number"
                      name="bedrooms"
                      value={formData.bedrooms}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Beds *
                    </label>
                    <input
                      type="number"
                      name="beds"
                      value={formData.beds}
                      onChange={handleInputChange}
                      required
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bathrooms *
                    </label>
                    <input
                      type="number"
                      name="bathrooms"
                      value={formData.bathrooms}
                      onChange={handleInputChange}
                      required
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Size (m²)
                  </label>
                  <input
                    type="number"
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              {/* Save button for Basic Information */}
              <div className="flex justify-end mt-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => saveSection('basic')}
                  disabled={savingSection === 'basic'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition flex items-center"
                >
                  {savingSection === 'basic' ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="w-4 h-4 mr-2" /> Save Basic Info</>
                  )}
                </button>
              </div>
              {sectionSuccess === 'basic' && (
                <div className="mt-2 text-green-600 text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" /> Basic information saved successfully!
                </div>
              )}
            </div>

            {/* Location */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Location</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country *
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              {/* Save button for Location */}
              <div className="flex justify-end mt-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => saveSection('location')}
                  disabled={savingSection === 'location'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition flex items-center"
                >
                  {savingSection === 'location' ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="w-4 h-4 mr-2" /> Save Location</>
                  )}
                </button>
              </div>
              {sectionSuccess === 'location' && (
                <div className="mt-2 text-green-600 text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" /> Location saved successfully!
                </div>
              )}
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Pricing</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price per Night (CHF) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cleaning Fee (CHF) *
                  </label>
                  <input
                    type="number"
                    name="cleaningFee"
                    value={formData.cleaningFee}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Stay (nights) *
                  </label>
                  <input
                    type="number"
                    name="minStayNights"
                    value={formData.minStayNights}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Stay (nights)
                  </label>
                  <input
                    type="number"
                    name="maxStayNights"
                    value={formData.maxStayNights}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Leave empty for no limit"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Booking Horizon
                  </label>
                  <input
                    type="date"
                    name="bookingHorizon"
                    value={formData.bookingHorizon}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Maximum date until which bookings can be made"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Guests can book until this date
                  </p>
                </div>
              </div>
              
              {/* Save button for Pricing */}
              <div className="flex justify-end mt-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => saveSection('pricing')}
                  disabled={savingSection === 'pricing'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition flex items-center"
                >
                  {savingSection === 'pricing' ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="w-4 h-4 mr-2" /> Save Pricing</>
                  )}
                </button>
              </div>
              {sectionSuccess === 'pricing' && (
                <div className="mt-2 text-green-600 text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" /> Pricing saved successfully!
                </div>
              )}
            </div>

            {/* Advanced Pricing Management */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Advanced Pricing Management</h2>
              <PricingManager
                apartmentId={apartment.id}
                basePrice={formData.price}
              />
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {amenities.map(amenity => (
                  <label
                    key={amenity.id}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes(amenity.id)}
                      onChange={() => toggleAmenity(amenity.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{amenity.name}</span>
                  </label>
                ))}
              </div>
              
              {/* Save button for Amenities */}
              <div className="flex justify-end mt-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => saveSection('amenities')}
                  disabled={savingSection === 'amenities'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition flex items-center"
                >
                  {savingSection === 'amenities' ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="w-4 h-4 mr-2" /> Save Amenities</>
                  )}
                </button>
              </div>
              {sectionSuccess === 'amenities' && (
                <div className="mt-2 text-green-600 text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" /> Amenities saved successfully!
                </div>
              )}
            </div>

            {/* Room-based Image Management */}
            <div className="bg-white rounded-lg shadow p-6">
              <RoomImageManager
                apartmentId={apartment.id}
                existingImages={apartment.apartmentImages}
                roomCategories={roomCategories}
              />
            </div>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Status & Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Status & Actions</h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="font-medium text-gray-700">Apartment Status</label>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className={`text-sm font-medium ${!formData.isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                        Inactive
                      </span>
                      <button
                        type="button"
                        onClick={handleToggleActive}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          formData.isActive ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            formData.isActive ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className={`text-sm font-medium ${formData.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                        Active
                      </span>
                    </div>
                    <div className="flex items-center">
                      {formData.isActive ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Visible
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                          </svg>
                          Hidden
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {formData.isActive 
                      ? 'This apartment is visible and bookable on the public website.' 
                      : 'This apartment is hidden from the public website.'}
                  </p>
                </div>

                <div className="pt-4 border-t space-y-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>

                  <a
                    href={`/apartments/${apartment.id}`}
                    target="_blank"
                    className="block w-full text-center bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
                  >
                    View Public Page
                  </a>
                </div>
              </div>
            </div>

            {/* Airbnb Integration */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Airbnb Integration</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Airbnb ID
                  </label>
                  <input
                    type="text"
                    name="airbnbId"
                    value={formData.airbnbId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 24131251"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Airbnb URL
                  </label>
                  <input
                    type="url"
                    name="airbnbUrl"
                    value={formData.airbnbUrl}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://www.airbnb.ch/rooms/..."
                  />
                </div>

                {formData.airbnbUrl && (
                  <a
                    href={formData.airbnbUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View on Airbnb →
                  </a>
                )}
              </div>

              {/* Save Button for Airbnb Integration */}
              <div className="pt-4 mt-4 border-t">
                <button
                  type="button"
                  onClick={() => saveSection('airbnb')}
                  disabled={savingSection === 'airbnb'}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 flex items-center justify-center"
                >
                  {savingSection === 'airbnb' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Airbnb Integration
                    </>
                  )}
                </button>
                {sectionSuccess === 'airbnb' && (
                  <p className="mt-2 text-sm text-green-600">Airbnb integration saved successfully!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}