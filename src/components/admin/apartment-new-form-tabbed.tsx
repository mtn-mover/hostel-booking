'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ApartmentNewFormTabbedProps {
  amenities: any[]
  roomCategories: any[]
}

export function ApartmentNewFormTabbed({ 
  amenities, 
  roomCategories 
}: ApartmentNewFormTabbedProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('basic')
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    name: '',
    description: '',
    price: 150,
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    size: 45,
    floor: '',
    roomNumber: '',
    address: '',
    city: 'Grindelwald',
    postalCode: '3818',
    country: 'Schweiz',
    latitude: null as number | null,
    longitude: null as number | null,
    checkInTime: '15:00',
    checkOutTime: '11:00',
    bookingHorizon: 365,
    minNights: 1,
    maxNights: 30,
    serviceFeePercentage: 10,
    isActive: true,
    mainImage: '',
    selectedAmenities: [] as string[],
    airbnbListingId: '',
    airbnbSyncEnabled: false
  })

  const tabs = [
    { id: 'basic', label: 'Grunddaten', icon: '📝' },
    { id: 'location', label: 'Standort', icon: '📍' },
    { id: 'pricing', label: 'Preise & Regeln', icon: '💰' },
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

  const validateForm = () => {
    if (!formData.title || !formData.name) {
      alert('Bitte füllen Sie Titel und Name aus')
      setActiveTab('basic')
      return false
    }
    if (!formData.description) {
      alert('Bitte fügen Sie eine Beschreibung hinzu')
      setActiveTab('basic')
      return false
    }
    if (!formData.city || !formData.country) {
      alert('Bitte füllen Sie Stadt und Land aus')
      setActiveTab('location')
      return false
    }
    if (formData.price <= 0) {
      alert('Bitte geben Sie einen gültigen Preis ein')
      setActiveTab('pricing')
      return false
    }
    return true
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/apartments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amenityIds: formData.selectedAmenities,
          minStayNights: formData.minNights,
          maxStayNights: formData.maxNights
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Failed to create apartment')
      }
      
      const apartment = await response.json()
      router.push(`/admin/apartments/${apartment.id}`)
    } catch (error) {
      console.error('Error creating apartment:', error)
      alert('Fehler beim Erstellen der Unterkunft')
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
      {/* Progress Indicator */}
      <div className="px-6 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Neue Unterkunft erstellen</h2>
          <div className="flex items-center text-sm text-gray-500">
            <span className="mr-2">Fortschritt:</span>
            <div className="flex space-x-1">
              {tabs.map((tab, index) => (
                <div
                  key={tab.id}
                  className={`w-8 h-1 rounded-full ${
                    tabs.findIndex(t => t.id === activeTab) >= index
                      ? 'bg-blue-600'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 px-6">
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
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                💡 Tipp: Wählen Sie einen aussagekräftigen Titel, der Gäste anspricht.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titel <span className="text-red-500">*</span>
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
                  Interner Name <span className="text-red-500">*</span>
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
                Beschreibung <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Beschreiben Sie die Unterkunft detailliert..."
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.description.length} Zeichen
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max. Gäste <span className="text-red-500">*</span>
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
                  Schlafzimmer <span className="text-red-500">*</span>
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
                  Badezimmer <span className="text-red-500">*</span>
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
          </div>
        )}

        {/* Location Tab */}
        {activeTab === 'location' && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                📍 Die genaue Adresse wird Gästen erst nach der Buchung angezeigt.
              </p>
            </div>

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
                  Stadt <span className="text-red-500">*</span>
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
                  Land <span className="text-red-500">*</span>
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
                  placeholder="46.6243"
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
                  placeholder="8.0413"
                />
              </div>
            </div>
          </div>
        )}

        {/* Pricing Tab */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Basispreis pro Nacht <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">CHF</span>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                    min="0"
                    step="0.01"
                    className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service-Gebühr (%)
                </label>
                <input
                  type="number"
                  value={formData.serviceFeePercentage}
                  onChange={(e) => handleInputChange('serviceFeePercentage', parseFloat(e.target.value))}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min. Nächte
                </label>
                <input
                  type="number"
                  value={formData.minNights}
                  onChange={(e) => handleInputChange('minNights', parseInt(e.target.value))}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max. Nächte
                </label>
                <input
                  type="number"
                  value={formData.maxNights}
                  onChange={(e) => handleInputChange('maxNights', parseInt(e.target.value))}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buchungshorizont (Tage)
                </label>
                <input
                  type="number"
                  value={formData.bookingHorizon}
                  onChange={(e) => handleInputChange('bookingHorizon', parseInt(e.target.value))}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in Zeit
                </label>
                <input
                  type="time"
                  value={formData.checkInTime}
                  onChange={(e) => handleInputChange('checkInTime', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-out Zeit
                </label>
                <input
                  type="time"
                  value={formData.checkOutTime}
                  onChange={(e) => handleInputChange('checkOutTime', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">💰 Preisübersicht</h4>
              <div className="space-y-1 text-sm text-blue-700">
                <p>Basispreis: CHF {formData.price.toFixed(2)} pro Nacht</p>
                <p>Service-Gebühr: {formData.serviceFeePercentage}%</p>
                <p>Beispiel für 3 Nächte: CHF {((formData.price * 3) * (1 + formData.serviceFeePercentage / 100)).toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Amenities Tab */}
        {activeTab === 'amenities' && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">
                ✨ Wählen Sie alle Ausstattungsmerkmale, die in der Unterkunft vorhanden sind.
                <br />
                <strong>{formData.selectedAmenities.length}</strong> Ausstattungsmerkmale ausgewählt
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
                    alt="Hauptbild Vorschau"
                    className="w-full max-w-md h-64 object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.jpg'
                    }}
                  />
                </div>
              )}
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">📷 Bilderverwaltung</h4>
              <p className="text-sm text-yellow-700">
                Nach dem Erstellen der Unterkunft können Sie weitere Bilder hinzufügen und verwalten.
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
                    Airbnb Listing ID
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

                {formData.airbnbListingId && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-700">
                      Die Unterkunft wird mit Airbnb verknüpft:
                      <br />
                      <a
                        href={`https://www.airbnb.com/rooms/${formData.airbnbListingId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        https://www.airbnb.com/rooms/{formData.airbnbListingId}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">🔗 Weitere Integrationen</h4>
              <p className="text-sm text-gray-600">
                Nach dem Erstellen können Sie weitere Buchungsplattformen wie Booking.com verbinden.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer with Actions */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-xl">
        <div className="flex justify-between items-center">
          <button
            onClick={() => {
              const currentIndex = tabs.findIndex(t => t.id === activeTab)
              if (currentIndex > 0) {
                setActiveTab(tabs[currentIndex - 1].id)
              }
            }}
            disabled={activeTab === 'basic'}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Zurück
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => router.push('/admin/apartments')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Abbrechen
            </button>
            
            {activeTab === 'integration' ? (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSaving ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Erstelle...
                  </>
                ) : (
                  <>
                    <span className="mr-2">✅</span>
                    Unterkunft erstellen
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => {
                  const currentIndex = tabs.findIndex(t => t.id === activeTab)
                  if (currentIndex < tabs.length - 1) {
                    setActiveTab(tabs[currentIndex + 1].id)
                  }
                }}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-medium flex items-center"
              >
                Weiter →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}