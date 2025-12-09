'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ApartmentEditFormTabbedProps {
  apartment: any
  amenities: any[]
  roomCategories: any[]
}

export function ApartmentEditFormTabbed({ 
  apartment, 
  amenities, 
  roomCategories 
}: ApartmentEditFormTabbedProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('basic')
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: apartment.title || '',
    name: apartment.name || '',
    description: apartment.description || '',
    price: apartment.price || 0,
    maxGuests: apartment.maxGuests || 1,
    bedrooms: apartment.bedrooms || 1,
    bathrooms: apartment.bathrooms || 1,
    size: apartment.size || 0,
    floor: apartment.floor || '',
    roomNumber: apartment.roomNumber || '',
    address: apartment.address || '',
    city: apartment.city || '',
    postalCode: apartment.postalCode || '',
    country: apartment.country || '',
    latitude: apartment.latitude || null,
    longitude: apartment.longitude || null,
    checkInTime: apartment.checkInTime || '15:00',
    checkOutTime: apartment.checkOutTime || '11:00',
    bookingHorizon: apartment.bookingHorizon || 365,
    minNights: apartment.minNights || 1,
    maxNights: apartment.maxNights || 30,
    serviceFeePercentage: apartment.serviceFeePercentage || 10,
    isActive: apartment.isActive ?? true,
    mainImage: apartment.mainImage || '',
    selectedAmenities: apartment.apartmentAmenities?.map((aa: any) => aa.amenity.id) || [],
    airbnbListingId: apartment.airbnbListingId || '',
    airbnbUrl: apartment.airbnbUrl || '',
    airbnbSyncEnabled: apartment.airbnbSyncEnabled || false
  })

  const tabs = [
    { id: 'basic', label: 'Grunddaten', icon: '📝' },
    { id: 'location', label: 'Standort', icon: '📍' },
    { id: 'amenities', label: 'Ausstattung', icon: '✨' },
    { id: 'images', label: 'Bilder', icon: '📷' },
    { id: 'integration', label: 'Integration', icon: '🔗' },
  ]

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAmenityToggle = (amenityId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedAmenities: prev.selectedAmenities.includes(amenityId)
        ? prev.selectedAmenities.filter(id => id !== amenityId)
        : [...prev.selectedAmenities, amenityId]
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/apartments/${apartment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amenityIds: formData.selectedAmenities
        })
      })

      if (!response.ok) throw new Error('Failed to save')
      
      router.refresh()
      // Show success message or notification
    } catch (error) {
      console.error('Error saving:', error)
      // Show error message
    } finally {
      setIsSaving(false)
    }
  }

  // Group amenities by category
  const amenitiesByCategory = amenities.reduce((acc, amenity) => {
    const category = amenity.category || 'Andere'
    if (!acc[category]) acc[category] = []
    acc[category].push(amenity)
    return acc
  }, {} as Record<string, typeof amenities>)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 px-6 pt-6">
        <nav className="-mb-px flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                group inline-flex items-center px-4 py-3 border-b-2 font-medium text-sm transition-all
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <span className="mr-2 text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Basic Tab */}
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titel
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="z.B. Gemütliches Studio im Zentrum"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="z.B. Studio 201"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Beschreibung
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Beschreiben Sie die Unterkunft..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max. Gäste
                </label>
                <input
                  type="number"
                  value={formData.maxGuests}
                  onChange={(e) => handleInputChange('maxGuests', parseInt(e.target.value))}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schlafzimmer
                </label>
                <input
                  type="number"
                  value={formData.bedrooms}
                  onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value))}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Badezimmer
                </label>
                <input
                  type="number"
                  value={formData.bathrooms}
                  onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value))}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Größe (m²)
                </label>
                <input
                  type="number"
                  value={formData.size}
                  onChange={(e) => handleInputChange('size', parseInt(e.target.value))}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Etage
                </label>
                <input
                  type="text"
                  value={formData.floor}
                  onChange={(e) => handleInputChange('floor', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="z.B. 2. Stock"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zimmernummer
                </label>
                <input
                  type="text"
                  value={formData.roomNumber}
                  onChange={(e) => handleInputChange('roomNumber', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="z.B. 201"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Unterkunft ist aktiv und buchbar
              </label>
            </div>
          </div>
        )}

        {/* Location Tab */}
        {activeTab === 'location' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Straße und Hausnummer"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stadt
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PLZ
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Land
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Breitengrad (Latitude)
                </label>
                <input
                  type="number"
                  value={formData.latitude || ''}
                  onChange={(e) => handleInputChange('latitude', e.target.value ? parseFloat(e.target.value) : null)}
                  step="0.000001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Längengrad (Longitude)
                </label>
                <input
                  type="number"
                  value={formData.longitude || ''}
                  onChange={(e) => handleInputChange('longitude', e.target.value ? parseFloat(e.target.value) : null)}
                  step="0.000001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                💡 Tipp: Die Koordinaten helfen bei der genauen Kartenpositionierung. 
                Sie können diese von Google Maps kopieren.
              </p>
            </div>
          </div>
        )}

        {/* Amenities Tab */}
        {activeTab === 'amenities' && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">
                Wählen Sie alle Ausstattungsmerkmale, die in der Unterkunft vorhanden sind.
              </p>
            </div>

            {Object.entries(amenitiesByCategory).map(([category, categoryAmenities]) => (
              <div key={category} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">{category}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {categoryAmenities.map((amenity) => (
                    <label
                      key={amenity.id}
                      className="flex items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.selectedAmenities.includes(amenity.id)}
                        onChange={() => handleAmenityToggle(amenity.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 flex items-center">
                        {amenity.icon && <span className="mr-1">{amenity.icon}</span>}
                        {amenity.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                <strong>{formData.selectedAmenities.length}</strong> Ausstattungsmerkmale ausgewählt
              </p>
            </div>
          </div>
        )}

        {/* Images Tab */}
        {activeTab === 'images' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hauptbild URL
              </label>
              <input
                type="text"
                value={formData.mainImage}
                onChange={(e) => handleInputChange('mainImage', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://..."
              />
              {formData.mainImage && (
                <div className="mt-4">
                  <img
                    src={formData.mainImage}
                    alt="Hauptbild"
                    className="w-full max-w-md h-64 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Weitere Bilder</h4>
              <p className="text-sm text-gray-600">
                Die Verwaltung weiterer Bilder ist in Entwicklung.
              </p>
            </div>
          </div>
        )}

        {/* Integration Tab */}
        {activeTab === 'integration' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Airbnb Integration</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Airbnb URL (Link zur Buchungsseite)
                  </label>
                  <input
                    type="url"
                    value={formData.airbnbUrl}
                    onChange={(e) => handleInputChange('airbnbUrl', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://www.airbnb.com/rooms/123456789"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Diese URL wird Gästen angezeigt, um direkt auf Airbnb zu buchen.
                  </p>
                </div>

                {formData.airbnbUrl && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-700 flex items-center">
                      <span className="mr-2">✓</span>
                      Airbnb-Link konfiguriert:
                      <a
                        href={formData.airbnbUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 underline font-medium"
                      >
                        Listing ansehen →
                      </a>
                    </p>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Erweiterte Einstellungen</h4>

                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Airbnb Listing ID (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.airbnbListingId}
                      onChange={(e) => handleInputChange('airbnbListingId', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="z.B. 123456789"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="airbnbSync"
                      checked={formData.airbnbSyncEnabled}
                      onChange={(e) => handleInputChange('airbnbSyncEnabled', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="airbnbSync" className="ml-2 block text-sm text-gray-900">
                      Automatische Synchronisation aktivieren
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Weitere Integrationen</h4>
              <p className="text-sm text-gray-600">
                Booking.com und andere Plattformen können hier in Zukunft hinzugefügt werden.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer with Save Buttons */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-xl">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Zuletzt geändert: {new Date(apartment.updatedAt).toLocaleDateString('de-CH')}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/admin/apartments')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSaving ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Speichern...
                </>
              ) : (
                <>
                  <span className="mr-2">💾</span>
                  Änderungen speichern
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}