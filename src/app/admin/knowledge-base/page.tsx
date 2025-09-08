'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function KnowledgeBasePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  
  const [knowledgeBase, setKnowledgeBase] = useState({
    general: {
      name: "Heart of Interlaken Apartments",
      address: "",
      phone: "",
      email: "",
      website: "https://heartofinterlaken.ch",
      languages: ["Deutsch", "English", "Français"]
    },
    checkin: {
      standardTime: "ab 17:00 Uhr",
      lateCheckin: "Kein Problem - Self Check-in mit Code verfügbar",
      earlyCheckin: "Vor 17:00 nach Absprache möglich",
      selfCheckin: "24/7 Self Check-in über Schlüsselbox mit Code",
      checkoutTime: "11:00 Uhr",
      keyReturn: "Schlüssel in Schlüsselbox zurücklegen"
    },
    wifi: {
      network: "",
      password: "",
      speed: "Highspeed Internet",
      coverage: "100% Abdeckung in allen Räumen"
    },
    location: {
      trainStation: "",
      busStop: "",
      parking: "",
      nearbyShops: ""
    },
    apartments: {
      heart1: {
        name: "Heart 1",
        maxGuests: 2,
        description: "",
        amenities: "",
        price: ""
      },
      heart2: {
        name: "Heart 2",
        maxGuests: 4,
        description: "",
        amenities: "",
        price: ""
      },
      heart3: {
        name: "Heart 3",
        maxGuests: 4,
        description: "",
        amenities: "",
        price: ""
      },
      heart4: {
        name: "Heart 4",
        maxGuests: 4,
        description: "",
        amenities: "",
        price: ""
      },
      heart5: {
        name: "Heart 5",
        maxGuests: 6,
        description: "",
        amenities: "",
        price: ""
      }
    },
    policies: {
      checkInFee: "Keine Early oder Late Check-in Gebühren",
      pets: "",
      smoking: "Rauchfrei in allen Apartments",
      parties: "Keine Partys erlaubt",
      cancellation: ""
    }
  })

  useEffect(() => {
    loadKnowledgeBase()
  }, [])

  const loadKnowledgeBase = async () => {
    try {
      const response = await fetch('/api/admin/knowledge-base')
      if (response.ok) {
        const data = await response.json()
        setKnowledgeBase(data.knowledgeBase || knowledgeBase)
      }
    } catch (error) {
      console.error('Error loading knowledge base:', error)
    }
  }

  const saveKnowledgeBase = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/knowledge-base', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ knowledgeBase })
      })

      if (response.ok) {
        alert('Knowledge Base erfolgreich gespeichert!')
      } else {
        alert('Fehler beim Speichern')
      }
    } catch (error) {
      console.error('Error saving knowledge base:', error)
      alert('Fehler beim Speichern')
    }
    setIsLoading(false)
  }

  const updateField = (section: string, field: string, value: any) => {
    setKnowledgeBase(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }))
  }

  const updateApartment = (apartment: string, field: string, value: string) => {
    setKnowledgeBase(prev => ({
      ...prev,
      apartments: {
        ...prev.apartments,
        [apartment]: {
          ...prev.apartments[apartment as keyof typeof prev.apartments],
          [field]: value
        }
      }
    }))
  }

  const tabs = [
    { id: 'general', label: 'Allgemein', icon: '🏠' },
    { id: 'checkin', label: 'Check-in/out', icon: '🔑' },
    { id: 'wifi', label: 'WiFi', icon: '📶' },
    { id: 'location', label: 'Standort', icon: '📍' },
    { id: 'apartments', label: 'Apartments', icon: '🛏️' },
    { id: 'policies', label: 'Richtlinien', icon: '📋' }
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Knowledge Base Verwaltung</h1>
        <p className="mt-2 text-gray-600">
          Grundinformationen für den Chat Bot bearbeiten
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Allgemeine Informationen</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name der Unterkunft
              </label>
              <input
                type="text"
                value={knowledgeBase.general.name}
                onChange={(e) => updateField('general', 'name', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse
              </label>
              <input
                type="text"
                value={knowledgeBase.general.address}
                onChange={(e) => updateField('general', 'address', e.target.value)}
                placeholder="z.B. Hauptstrasse 15, 3800 Interlaken"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <input
                  type="text"
                  value={knowledgeBase.general.phone}
                  onChange={(e) => updateField('general', 'phone', e.target.value)}
                  placeholder="+41 79 xxx xx xx"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={knowledgeBase.general.email}
                  onChange={(e) => updateField('general', 'email', e.target.value)}
                  placeholder="info@heartofinterlaken.ch"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="text"
                value={knowledgeBase.general.website}
                onChange={(e) => updateField('general', 'website', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
        )}

        {/* Check-in Tab */}
        {activeTab === 'checkin' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Check-in / Check-out Informationen</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Standard Check-in Zeit
              </label>
              <input
                type="text"
                value={knowledgeBase.checkin.standardTime}
                onChange={(e) => updateField('checkin', 'standardTime', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Late Check-in Information
              </label>
              <input
                type="text"
                value={knowledgeBase.checkin.lateCheckin}
                onChange={(e) => updateField('checkin', 'lateCheckin', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Early Check-in
              </label>
              <input
                type="text"
                value={knowledgeBase.checkin.earlyCheckin}
                onChange={(e) => updateField('checkin', 'earlyCheckin', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check-out Zeit
              </label>
              <input
                type="text"
                value={knowledgeBase.checkin.checkoutTime}
                onChange={(e) => updateField('checkin', 'checkoutTime', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Self Check-in Prozess
              </label>
              <textarea
                value={knowledgeBase.checkin.selfCheckin}
                onChange={(e) => updateField('checkin', 'selfCheckin', e.target.value)}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
        )}

        {/* WiFi Tab */}
        {activeTab === 'wifi' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">WiFi Informationen</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WiFi Netzwerk Name
              </label>
              <input
                type="text"
                value={knowledgeBase.wifi.network}
                onChange={(e) => updateField('wifi', 'network', e.target.value)}
                placeholder="z.B. Heart_Guest_WiFi"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WiFi Passwort
              </label>
              <input
                type="text"
                value={knowledgeBase.wifi.password}
                onChange={(e) => updateField('wifi', 'password', e.target.value)}
                placeholder="Sicheres Passwort"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Internet Geschwindigkeit
              </label>
              <input
                type="text"
                value={knowledgeBase.wifi.speed}
                onChange={(e) => updateField('wifi', 'speed', e.target.value)}
                placeholder="z.B. 200 Mbps Glasfaser"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
        )}

        {/* Location Tab */}
        {activeTab === 'location' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Standort & Umgebung</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nächster Bahnhof
              </label>
              <input
                type="text"
                value={knowledgeBase.location.trainStation}
                onChange={(e) => updateField('location', 'trainStation', e.target.value)}
                placeholder="z.B. Interlaken Ost, 10 Min zu Fuss"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bushaltestelle
              </label>
              <input
                type="text"
                value={knowledgeBase.location.busStop}
                onChange={(e) => updateField('location', 'busStop', e.target.value)}
                placeholder="z.B. Direkt vor dem Haus, Linie 103"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parkplätze
              </label>
              <textarea
                value={knowledgeBase.location.parking}
                onChange={(e) => updateField('location', 'parking', e.target.value)}
                placeholder="z.B. Kostenlose Parkplätze direkt beim Haus"
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Geschäfte in der Nähe
              </label>
              <textarea
                value={knowledgeBase.location.nearbyShops}
                onChange={(e) => updateField('location', 'nearbyShops', e.target.value)}
                placeholder="z.B. Coop 2 Min, Migros 5 Min, Apotheke 3 Min"
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
        )}

        {/* Apartments Tab */}
        {activeTab === 'apartments' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold mb-4">Apartment Details</h2>
            
            {Object.entries(knowledgeBase.apartments).map(([key, apartment]) => (
              <div key={key} className="border rounded-lg p-4 space-y-3">
                <h3 className="font-medium text-blue-600">{apartment.name}</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max. Gäste
                    </label>
                    <input
                      type="number"
                      value={apartment.maxGuests}
                      onChange={(e) => updateApartment(key, 'maxGuests', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preis pro Nacht
                    </label>
                    <input
                      type="text"
                      value={apartment.price}
                      onChange={(e) => updateApartment(key, 'price', e.target.value)}
                      placeholder="z.B. CHF 120"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Beschreibung
                  </label>
                  <textarea
                    value={apartment.description}
                    onChange={(e) => updateApartment(key, 'description', e.target.value)}
                    placeholder="z.B. Gemütliches Studio mit Bergblick"
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ausstattung
                  </label>
                  <textarea
                    value={apartment.amenities}
                    onChange={(e) => updateApartment(key, 'amenities', e.target.value)}
                    placeholder="z.B. Küche, Bad, TV, WiFi, Balkon"
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Policies Tab */}
        {activeTab === 'policies' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Richtlinien & Gebühren</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check-in Gebühren
              </label>
              <input
                type="text"
                value={knowledgeBase.policies.checkInFee}
                onChange={(e) => updateField('policies', 'checkInFee', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Haustiere
              </label>
              <input
                type="text"
                value={knowledgeBase.policies.pets}
                onChange={(e) => updateField('policies', 'pets', e.target.value)}
                placeholder="z.B. Kleine Hunde erlaubt, CHF 20/Nacht"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rauchen
              </label>
              <input
                type="text"
                value={knowledgeBase.policies.smoking}
                onChange={(e) => updateField('policies', 'smoking', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Partys
              </label>
              <input
                type="text"
                value={knowledgeBase.policies.parties}
                onChange={(e) => updateField('policies', 'parties', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stornierungsbedingungen
              </label>
              <textarea
                value={knowledgeBase.policies.cancellation}
                onChange={(e) => updateField('policies', 'cancellation', e.target.value)}
                placeholder="z.B. Kostenlose Stornierung bis 24h vor Anreise"
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveKnowledgeBase}
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
        >
          {isLoading ? 'Speichert...' : 'Speichern'}
        </button>
      </div>
    </div>
  )
}