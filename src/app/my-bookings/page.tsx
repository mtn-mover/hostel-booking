'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/utils'

interface Booking {
  id: string
  apartmentId: string
  checkIn: string
  checkOut: string
  guests: number
  totalPrice: number
  status: string
  paymentStatus: string
  guestName: string
  guestEmail: string
  createdAt: string
  apartment: {
    title: string
  }
}

export default function MyBookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [searchEmail, setSearchEmail] = useState('')

  const fetchBookings = async (guestEmail: string) => {
    if (!guestEmail) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/bookings/by-email?email=${encodeURIComponent(guestEmail)}`)
      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings || [])
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    if (email) {
      setSearchEmail(email)
      fetchBookings(email)
    }
  }

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Möchten Sie diese Buchung wirklich stornieren?')) return

    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST'
      })

      if (response.ok) {
        // Refresh bookings
        fetchBookings(searchEmail)
        alert('Buchung erfolgreich storniert')
      } else {
        alert('Fehler beim Stornieren der Buchung')
      }
    } catch (error) {
      console.error('Cancel error:', error)
      alert('Fehler beim Stornieren der Buchung')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'text-green-600 bg-green-50'
      case 'PENDING': return 'text-yellow-600 bg-yellow-50'
      case 'CANCELLED': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'Bestätigt'
      case 'PENDING': return 'Ausstehend'
      case 'CANCELLED': return 'Storniert'
      default: return status
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Meine Buchungen</h1>

          {/* Email Search */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Geben Sie Ihre E-Mail-Adresse ein"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Buchungen suchen
              </button>
            </div>
          </div>

          {/* Bookings List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="availability-loading mb-4"></div>
              <p className="text-gray-600">Lade Buchungen...</p>
            </div>
          ) : bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map(booking => (
                <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {booking.apartment.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Buchungs-ID: {booking.id}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                      {getStatusText(booking.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-gray-600">Check-in</span>
                      <p className="font-medium">
                        {new Date(booking.checkIn).toLocaleDateString('de-CH')}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Check-out</span>
                      <p className="font-medium">
                        {new Date(booking.checkOut).toLocaleDateString('de-CH')}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Gäste</span>
                      <p className="font-medium">{booking.guests}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Gesamtpreis</span>
                      <p className="font-medium">{formatPrice(booking.totalPrice)}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-500">
                        Gebucht am: {new Date(booking.createdAt).toLocaleDateString('de-CH')}
                      </p>
                      {booking.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                        >
                          Stornieren
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchEmail ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">Keine Buchungen für diese E-Mail-Adresse gefunden.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">Geben Sie Ihre E-Mail-Adresse ein, um Ihre Buchungen anzuzeigen.</p>
            </div>
          )}

          {/* Back Button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
              Zurück zur Startseite
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}