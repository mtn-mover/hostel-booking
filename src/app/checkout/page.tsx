'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { CheckoutForm } from '@/components/checkout/checkout-form'
import { formatPrice } from '@/lib/utils'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

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
  cleaningFee: number
  totalPrice: number
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [clientSecret, setClientSecret] = useState('')
  const [bookingId, setBookingId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null)

  useEffect(() => {
    // Get booking details from URL params
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
    const cleaningFee = searchParams.get('cleaningFee')
    const totalPrice = searchParams.get('totalPrice')

    if (!apartmentId || !checkIn || !checkOut || !guests || !totalPrice) {
      setError('Missing booking information')
      setLoading(false)
      return
    }

    setBookingDetails({
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
      cleaningFee: parseFloat(cleaningFee || '0'),
      totalPrice: parseFloat(totalPrice)
    })

    setLoading(false)
  }, [searchParams])

  const createPaymentIntent = async (guestInfo: any) => {
    if (!bookingDetails) {
      setError('Missing booking details')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apartmentId: bookingDetails.apartmentId,
          checkIn: bookingDetails.checkIn,
          checkOut: bookingDetails.checkOut,
          guests: bookingDetails.guests,
          totalPrice: bookingDetails.totalPrice,
          guestInfo
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent')
      }

      setClientSecret(data.clientSecret)
      setBookingId(data.bookingId)
    } catch (error) {
      console.error('Error creating payment intent:', error)
      setError(error instanceof Error ? error.message : 'Failed to initialize payment')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="availability-loading mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Checkout Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    )
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
            <h1 className="text-3xl font-bold text-gray-900">Complete your booking</h1>
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
                  {/* Base Price Breakdown */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {formatPrice(bookingDetails.originalPrice / bookingDetails.nights)} × {bookingDetails.nights} Nacht{bookingDetails.nights !== 1 ? 'e' : ''}
                      </span>
                      <span>{formatPrice(bookingDetails.originalPrice)}</span>
                    </div>
                    
                    {/* Show discount if applicable */}
                    {bookingDetails.discount > 0 && (
                      <div className="flex justify-between text-green-600 font-medium">
                        <span>Rabatt ({Math.round(bookingDetails.discount)}% für {bookingDetails.nights} Nächte)</span>
                        <span>-{formatPrice(bookingDetails.savings)}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Unterkunft (Zwischensumme)</span>
                      <span className="font-medium">{formatPrice(bookingDetails.basePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service-Gebühr (15%)</span>
                      <span>{formatPrice(bookingDetails.serviceFee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reinigungsgebühr</span>
                      <span>{formatPrice(bookingDetails.cleaningFee)}</span>
                    </div>
                    
                    {/* Tax calculation */}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Mehrwertsteuer (7.7%)</span>
                      <span>{formatPrice(bookingDetails.totalPrice * 0.077)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between font-bold text-lg pt-3 border-t-2 border-gray-300">
                    <span>Gesamtbetrag</span>
                    <span>{formatPrice(bookingDetails.totalPrice)}</span>
                  </div>
                  
                  <div className="text-xs text-gray-500 text-center pt-2">
                    Alle Preise verstehen sich inklusive Steuern und Gebühren
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Information</h2>
              
              {clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm 
                    clientSecret={clientSecret} 
                    bookingId={bookingId}
                    totalPrice={bookingDetails.totalPrice}
                  />
                </Elements>
              ) : (
                <Elements stripe={stripePromise}>
                  <CheckoutForm 
                    onGuestInfoSubmit={createPaymentIntent}
                    totalPrice={bookingDetails.totalPrice}
                  />
                </Elements>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="availability-loading"></div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}