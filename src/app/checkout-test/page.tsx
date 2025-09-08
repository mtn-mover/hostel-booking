'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useState } from 'react'
import { formatPrice } from '@/lib/utils'

interface BookingDetails {
  apartmentId: string
  apartmentName: string
  checkIn: string
  checkOut: string
  guests: number
  nights: number
  basePrice: number
  originalPrice: number
  discount: number
  savings: number
  serviceFee: number
  serviceFeePercentage: number
  cleaningFee: number
  totalPrice: number
  regularPriceTotal: number
  eventPriceTotal: number
  priceBreakdown: Array<{
    price: number
    nights: number
    totalForPrice: number
    priceType: 'base' | 'season' | 'event'
    name?: string
  }> | null
}

function CheckoutTestContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialRequests: ''
  })

  // Parse booking details from URL
  const getBookingDetails = (): BookingDetails | null => {
    const apartmentId = searchParams.get('apartmentId')
    const apartmentName = searchParams.get('apartmentName') || 'Apartment'
    const checkIn = searchParams.get('checkIn')
    const checkOut = searchParams.get('checkOut')
    const guests = searchParams.get('guests')
    const nights = searchParams.get('nights')
    const basePrice = searchParams.get('basePrice')
    const originalPrice = searchParams.get('originalPrice')
    const discount = searchParams.get('discount')
    const savings = searchParams.get('savings')
    const serviceFee = searchParams.get('serviceFee')
    const serviceFeePercentage = searchParams.get('serviceFeePercentage')
    const cleaningFee = searchParams.get('cleaningFee')
    const totalPrice = searchParams.get('totalPrice')
    const regularPriceTotal = searchParams.get('regularPriceTotal')
    const eventPriceTotal = searchParams.get('eventPriceTotal')
    const priceBreakdownParam = searchParams.get('priceBreakdown')

    if (!apartmentId || !checkIn || !checkOut || !guests || !totalPrice) {
      return null
    }

    return {
      apartmentId,
      apartmentName,
      checkIn,
      checkOut,
      guests: parseInt(guests),
      nights: parseInt(nights || '1'),
      basePrice: parseFloat(basePrice || '0'),
      originalPrice: parseFloat(originalPrice || '0'),
      discount: parseFloat(discount || '0'),
      savings: parseFloat(savings || '0'),
      serviceFee: parseFloat(serviceFee || '0'),
      serviceFeePercentage: parseFloat(serviceFeePercentage || '15'),
      cleaningFee: parseFloat(cleaningFee || '0'),
      totalPrice: parseFloat(totalPrice),
      regularPriceTotal: parseFloat(regularPriceTotal || '0'),
      eventPriceTotal: parseFloat(eventPriceTotal || '0'),
      priceBreakdown: priceBreakdownParam ? JSON.parse(decodeURIComponent(priceBreakdownParam)) : null
    }
  }

  const bookingDetails = getBookingDetails()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bookingDetails) return

    setLoading(true)
    try {
      const response = await fetch('/api/bookings/create-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apartmentId: bookingDetails.apartmentId,
          checkIn: bookingDetails.checkIn,
          checkOut: bookingDetails.checkOut,
          guests: bookingDetails.guests,
          totalPrice: bookingDetails.totalPrice,
          guestInfo: formData
        })
      })

      if (response.ok) {
        const data = await response.json()
        // Redirect to success page
        router.push(`/booking-success?bookingId=${data.bookingId}`)
      } else {
        alert('Booking failed. Please try again.')
      }
    } catch (error) {
      console.error('Booking error:', error)
      alert('Booking failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!bookingDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Booking</h1>
          <p className="text-gray-600 mb-6">Booking information is missing or invalid.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Return Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4"
            >
              ← Back to apartment
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Test Booking (No Payment)</h1>
            <p className="text-amber-600 mt-2">⚠️ This is a test booking - no payment will be processed</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Booking Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Summary</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{bookingDetails.apartmentName}</h3>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Check-in</span>
                    <p className="font-medium">{new Date(bookingDetails.checkIn).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Check-out</span>
                    <p className="font-medium">{new Date(bookingDetails.checkOut).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Guests</span>
                    <p className="font-medium">{bookingDetails.guests}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Nights</span>
                    <p className="font-medium">{bookingDetails.nights}</p>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  {/* Detailed Price Breakdown */}
                  {bookingDetails.priceBreakdown && bookingDetails.priceBreakdown.length > 0 ? (
                    <div className="space-y-1">
                      {bookingDetails.priceBreakdown.map((breakdown, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {breakdown.nights}x CHF {breakdown.price}
                            {breakdown.name && breakdown.priceType === 'event' && (
                              <span className="ml-1 text-xs text-orange-600">({breakdown.name})</span>
                            )}
                            {breakdown.name && breakdown.priceType === 'season' && (
                              <span className="ml-1 text-xs text-blue-600">({breakdown.name})</span>
                            )}
                          </span>
                          <span>{formatPrice(breakdown.totalForPrice)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {formatPrice(bookingDetails.originalPrice / bookingDetails.nights)} × {bookingDetails.nights} Nacht{bookingDetails.nights !== 1 ? 'e' : ''}
                      </span>
                      <span>{formatPrice(bookingDetails.originalPrice)}</span>
                    </div>
                  )}
                  
                  {/* Subtotal if multiple prices */}
                  {bookingDetails.priceBreakdown && bookingDetails.priceBreakdown.length > 1 && (
                    <div className="flex justify-between text-sm font-medium pt-1 border-t">
                      <span>Zwischensumme</span>
                      <span>{formatPrice(bookingDetails.originalPrice)}</span>
                    </div>
                  )}
                  
                  {/* Discount */}
                  {bookingDetails.discount > 0 && bookingDetails.regularPriceTotal > 0 && (
                    <div className="space-y-1">
                      {bookingDetails.regularPriceTotal < bookingDetails.originalPrice && (
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Rabattfähiger Betrag</span>
                          <span>{formatPrice(bookingDetails.regularPriceTotal)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm text-green-600 font-medium">
                        <span>
                          Rabatt ({Math.round(bookingDetails.discount)}% für {bookingDetails.nights} Nächte)
                        </span>
                        <span>-{formatPrice(bookingDetails.savings)}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Event prices */}
                  {bookingDetails.eventPriceTotal > 0 && (
                    <div className="flex justify-between text-sm text-orange-600">
                      <span>Event-Preise (kein Rabatt)</span>
                      <span>{formatPrice(bookingDetails.eventPriceTotal)}</span>
                    </div>
                  )}

                  <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Unterkunft nach Rabatt</span>
                      <span className="font-medium">{formatPrice(bookingDetails.basePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service-Gebühr ({Math.round(bookingDetails.serviceFeePercentage)}%)</span>
                      <span>{formatPrice(bookingDetails.serviceFee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reinigungsgebühr</span>
                      <span>{formatPrice(bookingDetails.cleaningFee)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between font-bold text-lg pt-3 border-t-2 border-gray-300">
                    <span>Gesamtbetrag</span>
                    <span>{formatPrice(bookingDetails.totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Guest Information Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Guest Information</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+41 12 345 67 89"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Requests
                  </label>
                  <textarea
                    value={formData.specialRequests}
                    onChange={(e) => setFormData({...formData, specialRequests: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Any special requests or notes..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  {loading ? 'Processing...' : 'Confirm Test Booking (No Payment)'}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  This is a test booking. No payment will be processed.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutTestPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="availability-loading mb-4"></div>
          <p className="text-gray-600">Loading test checkout...</p>
        </div>
      </div>
    }>
      <CheckoutTestContent />
    </Suspense>
  )
}