'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Save,
  Loader2,
  AlertCircle,
  Home,
  Users,
  FileText,
  MapPin,
  Sparkles,
  Image as ImageIcon,
  Link as LinkIcon
} from 'lucide-react'
import { RoomImageManager } from './room-image-manager'

// Types
interface ApartmentData {
  id?: string
  title: string
  name?: string | null
  description: string
  shortDescription?: string | null
  theSpace?: string | null
  guestAccess?: string | null
  otherNotes?: string | null
  maxGuests: number
  bedrooms: number
  beds: number
  bathrooms: number
  address?: string | null
  city: string
  country: string
  latitude?: number | null
  longitude?: number | null
  isActive: boolean
  airbnbId?: string | null
  airbnbUrl?: string | null
  apartmentImages?: any[]
  apartmentAmenities?: any[]
}

interface WizardProps {
  mode: 'create' | 'edit'
  apartment?: ApartmentData
  amenities: any[]
  roomCategories: any[]
}

interface StepConfig {
  id: string
  title: string
  icon: React.ReactNode
  description: string
}

// Steps for edit mode (includes images)
const STEPS_EDIT: StepConfig[] = [
  { id: 'basic', title: 'Grunddaten', icon: <Home className="w-5 h-5" />, description: 'Titel und Beschreibung' },
  { id: 'details', title: 'Details', icon: <Users className="w-5 h-5" />, description: 'Gäste, Zimmer, Betten' },
  { id: 'description', title: 'Beschreibungen', icon: <FileText className="w-5 h-5" />, description: 'Detaillierte Infos' },
  { id: 'location', title: 'Standort', icon: <MapPin className="w-5 h-5" />, description: 'Adresse und Ort' },
  { id: 'amenities', title: 'Ausstattung', icon: <Sparkles className="w-5 h-5" />, description: 'Annehmlichkeiten' },
  { id: 'images', title: 'Bilder', icon: <ImageIcon className="w-5 h-5" />, description: 'Fotos hochladen' },
  { id: 'integration', title: 'Integration', icon: <LinkIcon className="w-5 h-5" />, description: 'Airbnb & Status' },
]

// Steps for create mode (no images - upload after saving)
const STEPS_CREATE: StepConfig[] = [
  { id: 'basic', title: 'Grunddaten', icon: <Home className="w-5 h-5" />, description: 'Titel und Beschreibung' },
  { id: 'details', title: 'Details', icon: <Users className="w-5 h-5" />, description: 'Gäste, Zimmer, Betten' },
  { id: 'description', title: 'Beschreibungen', icon: <FileText className="w-5 h-5" />, description: 'Detaillierte Infos' },
  { id: 'location', title: 'Standort', icon: <MapPin className="w-5 h-5" />, description: 'Adresse und Ort' },
  { id: 'amenities', title: 'Ausstattung', icon: <Sparkles className="w-5 h-5" />, description: 'Annehmlichkeiten' },
  { id: 'integration', title: 'Integration', icon: <LinkIcon className="w-5 h-5" />, description: 'Airbnb & Status' },
]

const defaultFormData: ApartmentData = {
  title: '',
  name: '',
  description: '',
  shortDescription: '',
  theSpace: '',
  guestAccess: '',
  otherNotes: '',
  maxGuests: 2,
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  address: '',
  city: 'Grindelwald',
  country: 'Schweiz',
  latitude: null,
  longitude: null,
  isActive: false,
  airbnbId: '',
  airbnbUrl: '',
  apartmentImages: [],
  apartmentAmenities: []
}

export function ApartmentWizard({ mode, apartment, amenities, roomCategories }: WizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Use different steps based on mode
  const STEPS = mode === 'create' ? STEPS_CREATE : STEPS_EDIT

  // Form state
  const [formData, setFormData] = useState<ApartmentData>(() => {
    if (mode === 'edit' && apartment) {
      return {
        ...defaultFormData,
        ...apartment,
        title: apartment.title || apartment.name || '',
        theSpace: apartment.theSpace || '',
        guestAccess: apartment.guestAccess || '',
        otherNotes: apartment.otherNotes || '',
      }
    }
    return defaultFormData
  })

  // Selected amenities
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(() => {
    if (mode === 'edit' && apartment?.apartmentAmenities) {
      return apartment.apartmentAmenities.map((aa: any) => aa.amenityId)
    }
    return []
  })

  // Track changes
  useEffect(() => {
    setHasUnsavedChanges(true)
  }, [formData, selectedAmenities])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
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

  const validateStep = (step: number): boolean => {
    switch (STEPS[step].id) {
      case 'basic':
        if (!formData.title.trim()) {
          setError('Bitte geben Sie einen Titel ein')
          return false
        }
        if (!formData.description.trim()) {
          setError('Bitte geben Sie eine Beschreibung ein')
          return false
        }
        break
      case 'details':
        if (formData.maxGuests < 1) {
          setError('Mindestens 1 Gast erforderlich')
          return false
        }
        if (formData.beds < 1) {
          setError('Mindestens 1 Bett erforderlich')
          return false
        }
        break
      case 'location':
        if (!formData.city.trim()) {
          setError('Bitte geben Sie eine Stadt ein')
          return false
        }
        if (!formData.country.trim()) {
          setError('Bitte geben Sie ein Land ein')
          return false
        }
        break
    }
    setError(null)
    return true
  }

  const goToStep = (step: number) => {
    if (step < currentStep || validateStep(currentStep)) {
      setCurrentStep(step)
      setError(null)
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
      setError(null)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
      setError(null)
    }
  }

  const saveApartment = async (publish: boolean = false) => {
    setIsSaving(true)
    setError(null)

    try {
      const dataToSave = {
        ...formData,
        isActive: publish ? true : formData.isActive,
        amenityIds: selectedAmenities,
        // Set default values for hidden fields
        price: 0,
        cleaningFee: 0,
        minStayNights: 1,
      }

      let response: Response

      if (mode === 'create') {
        response = await fetch('/api/admin/apartments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSave)
        })
      } else {
        response = await fetch(`/api/admin/apartments/${apartment?.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSave)
        })
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Fehler beim Speichern')
      }

      const result = await response.json()
      setHasUnsavedChanges(false)
      setSuccess('Apartment erfolgreich gespeichert!')

      if (mode === 'create') {
        // Redirect to edit page for the new apartment
        setTimeout(() => {
          router.push(`/admin/apartments/${result.id}`)
        }, 1500)
      } else {
        router.refresh()
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleActive = async () => {
    if (mode === 'create') return

    try {
      const response = await fetch(`/api/admin/apartments/${apartment?.id}/toggle-active`, {
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

  // Render step content
  const renderStepContent = () => {
    const stepId = STEPS[currentStep].id

    switch (stepId) {
      case 'basic':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titel *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="z.B. Gemütliche Ferienwohnung mit Bergblick"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              />
              <p className="mt-1 text-sm text-gray-500">
                Der Titel wird auf der Website und in Suchergebnissen angezeigt
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kurzbeschreibung
              </label>
              <input
                type="text"
                name="shortDescription"
                value={formData.shortDescription || ''}
                onChange={handleInputChange}
                placeholder="z.B. Moderne 2-Zimmer-Wohnung im Zentrum"
                maxLength={200}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Kurze Zusammenfassung für die Kartenansicht (max. 200 Zeichen)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Beschreibung *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={6}
                placeholder="Beschreiben Sie Ihre Unterkunft ausführlich..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Hauptbeschreibung der Unterkunft
              </p>
            </div>
          </div>
        )

      case 'details':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximale Gäste *
                </label>
                <input
                  type="number"
                  name="maxGuests"
                  value={formData.maxGuests}
                  onChange={handleInputChange}
                  min="1"
                  max="20"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schlafzimmer *
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  min="0"
                  max="20"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Betten *
                </label>
                <input
                  type="number"
                  name="beds"
                  value={formData.beds}
                  onChange={handleInputChange}
                  min="1"
                  max="50"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Badezimmer *
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  min="0.5"
                  max="10"
                  step="0.5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                />
                <p className="mt-1 text-sm text-gray-500">
                  0.5 = Gäste-WC / halbes Bad
                </p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Zusammenfassung</h4>
              <p className="text-blue-800">
                {formData.maxGuests} Gäste · {formData.bedrooms} Schlafzimmer · {formData.beds} Betten · {formData.bathrooms} {formData.bathrooms === 1 ? 'Badezimmer' : 'Badezimmer'}
              </p>
            </div>
          </div>
        )

      case 'description':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Der Raum (The Space)
              </label>
              <textarea
                name="theSpace"
                value={formData.theSpace || ''}
                onChange={handleInputChange}
                rows={4}
                placeholder="Beschreiben Sie den Raum und seine Besonderheiten..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Details über den Wohnraum, Aufteilung, besondere Merkmale
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gästezugang (Guest Access)
              </label>
              <textarea
                name="guestAccess"
                value={formData.guestAccess || ''}
                onChange={handleInputChange}
                rows={4}
                placeholder="Was können Gäste nutzen? Gibt es Gemeinschaftsbereiche?"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Welche Bereiche stehen den Gästen zur Verfügung
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weitere Hinweise (Other Things to Note)
              </label>
              <textarea
                name="otherNotes"
                value={formData.otherNotes || ''}
                onChange={handleInputChange}
                rows={4}
                placeholder="Wichtige Informationen für Gäste, Hausregeln, etc."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Zusätzliche wichtige Informationen
              </p>
            </div>
          </div>
        )

      case 'location':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse
              </label>
              <input
                type="text"
                name="address"
                value={formData.address || ''}
                onChange={handleInputChange}
                placeholder="Strasse und Hausnummer"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stadt *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Grindelwald"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Land *
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="Schweiz"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Breitengrad (Latitude)
                </label>
                <input
                  type="number"
                  name="latitude"
                  value={formData.latitude || ''}
                  onChange={handleInputChange}
                  step="0.000001"
                  placeholder="46.6247"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Längengrad (Longitude)
                </label>
                <input
                  type="number"
                  name="longitude"
                  value={formData.longitude || ''}
                  onChange={handleInputChange}
                  step="0.000001"
                  placeholder="8.0414"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )

      case 'amenities':
        // Group amenities by category
        const amenitiesByCategory = amenities.reduce((acc: any, amenity: any) => {
          const category = amenity.category || 'Sonstiges'
          if (!acc[category]) {
            acc[category] = []
          }
          acc[category].push(amenity)
          return acc
        }, {})

        return (
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-blue-800">
                <strong>{selectedAmenities.length}</strong> Ausstattungsmerkmale ausgewählt
              </p>
            </div>

            {Object.entries(amenitiesByCategory).map(([category, categoryAmenities]: [string, any]) => (
              <div key={category} className="border-b border-gray-200 pb-6 last:border-b-0">
                <h4 className="font-semibold text-gray-900 mb-4 text-lg">{category}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categoryAmenities.map((amenity: any) => (
                    <label
                      key={amenity.id}
                      className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAmenities.includes(amenity.id)}
                        onChange={() => toggleAmenity(amenity.id)}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                      />
                      {amenity.icon && (
                        <span className="text-xl mr-2">{amenity.icon}</span>
                      )}
                      <span className="text-gray-700">{amenity.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )

      case 'images':
        // Images step only available in edit mode
        return (
          <RoomImageManager
            apartmentId={apartment?.id || ''}
            existingImages={apartment?.apartmentImages || []}
            roomCategories={roomCategories}
          />
        )

      case 'integration':
        return (
          <div className="space-y-6">
            {/* Info for create mode */}
            {mode === 'create' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <ImageIcon className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-900">Bilder hochladen</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Nach dem Speichern des Apartments können Sie Bilder für jeden Raum hochladen.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Status Toggle */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">Apartment Status</h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-700">
                    {formData.isActive
                      ? 'Das Apartment ist aktiv und auf der Website sichtbar'
                      : 'Das Apartment ist deaktiviert und nicht sichtbar'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleActive}
                  disabled={mode === 'create'}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    formData.isActive ? 'bg-green-600' : 'bg-gray-300'
                  } ${mode === 'create' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      formData.isActive ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {mode === 'create' && (
                <p className="mt-2 text-sm text-gray-500">
                  Status kann nach dem Erstellen geändert werden
                </p>
              )}
            </div>

            {/* Airbnb Integration */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">Airbnb Integration</h4>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Airbnb Listing ID
                  </label>
                  <input
                    type="text"
                    name="airbnbId"
                    value={formData.airbnbId || ''}
                    onChange={handleInputChange}
                    placeholder="z.B. 18552489"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Airbnb URL
                  </label>
                  <input
                    type="url"
                    name="airbnbUrl"
                    value={formData.airbnbUrl || ''}
                    onChange={handleInputChange}
                    placeholder="https://www.airbnb.ch/rooms/18552489"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {formData.airbnbUrl && (
                  <a
                    href={formData.airbnbUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    Auf Airbnb anzeigen →
                  </a>
                )}
              </div>
            </div>

            {/* View Public Page (Edit mode only) */}
            {mode === 'edit' && apartment?.id && (
              <div className="bg-gray-50 rounded-lg p-4">
                <a
                  href={`/apartments/${apartment.id}`}
                  target="_blank"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Öffentliche Seite anzeigen
                </a>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((step, index) => (
            <button
              key={step.id}
              onClick={() => goToStep(index)}
              className={`flex flex-col items-center flex-1 relative ${
                index <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
              }`}
              disabled={index > currentStep && mode === 'create'}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
                  index < currentStep
                    ? 'bg-green-500 text-white'
                    : index === currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index < currentStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step.icon
                )}
              </div>
              <span className={`text-xs font-medium hidden md:block ${
                index === currentStep ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {step.title}
              </span>

              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div
                  className={`absolute top-5 left-[calc(50%+20px)] w-[calc(100%-40px)] h-0.5 ${
                    index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Step Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {STEPS[currentStep].title}
        </h2>
        <p className="text-gray-600">{STEPS[currentStep].description}</p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
          <Check className="w-5 h-5 mr-2 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 min-h-[400px]">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 0}
          className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
            currentStep === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Zurück
        </button>

        <div className="flex items-center gap-3">
          {/* Save Draft button (always visible) */}
          <button
            type="button"
            onClick={() => saveApartment(false)}
            disabled={isSaving}
            className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:bg-gray-400"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Speichern...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Speichern
              </>
            )}
          </button>

          {currentStep < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Weiter
              <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => saveApartment(true)}
              disabled={isSaving}
              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Speichern...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Speichern & Aktivieren
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Unsaved changes warning */}
      {hasUnsavedChanges && mode === 'edit' && (
        <div className="mt-4 text-center text-sm text-amber-600">
          Sie haben ungespeicherte Änderungen
        </div>
      )}
    </div>
  )
}
