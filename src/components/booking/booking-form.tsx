'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DateRange } from 'react-day-picker'
import { formatPrice, calculateNights } from '@/lib/utils'
import { CalendarModal } from './calendar-modal'

interface BookingFormProps {
  apartment: {
    id: string
    title: string
    price: number
    maxGuests: number
    bedrooms: number
    bathrooms: number
  }
  availabilities: Array<{
    date: Date
    status: string
    priceOverride: number | null
  }>
  bookingHorizon?: string
}

interface PriceBreakdown {
  dateRange: string
  nights: number
  priceType: string
  pricePerNight: number
  subtotal: number
  discountApplied: boolean
  discountAmount: number
  total: number
}

interface PricingDetails {
  nights: number
  pricePerNight: number[]
  priceBreakdown: PriceBreakdown[]
  subtotal: number
  discountPercentage: number
  discountAmount: number
  cleaningFee: number
  serviceFee: number
  total: number
}

export function BookingForm({ apartment, availabilities, bookingHorizon }: BookingFormProps) {
  const router = useRouter()
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>()
  const [guests, setGuests] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [showCalendarModal, setShowCalendarModal] = useState(false)
  const [pricingDetails, setPricingDetails] = useState<PricingDetails | null>(null)
  const [loadingPrice, setLoadingPrice] = useState(false)
  
  const minStayNights = 1 // Default minimum stay

  const nights = selectedDateRange?.from && selectedDateRange?.to 
    ? calculateNights(selectedDateRange.from, selectedDateRange.to)
    : 0

  // Fetch pricing details when dates change
  useEffect(() => {
    if (selectedDateRange?.from && selectedDateRange?.to) {
      fetchPricingDetails()
    } else {
      setPricingDetails(null)
    }
  }, [selectedDateRange])

  const fetchPricingDetails = async () => {
    if (!selectedDateRange?.from || !selectedDateRange?.to) return
    
    setLoadingPrice(true)
    try {
      const response = await fetch(`/api/apartments/${apartment.id}/calculate-price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkIn: selectedDateRange.from.toISOString(),
          checkOut: selectedDateRange.to.toISOString()
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setPricingDetails(data)
      }
    } catch (error) {
      console.error('Failed to fetch pricing:', error)
    } finally {
      setLoadingPrice(false)
    }
  }

  const handleDateChange = (range: DateRange | undefined) => {
    setSelectedDateRange(range)
  }

  const handleBooking = async () => {
    if (!selectedDateRange?.from || !selectedDateRange?.to || guests < 1) {
      alert('Please select dates and number of guests')
      return
    }

    const minStayNightsCheck = 1 // Default minimum stay
    if (nights < minStayNightsCheck) {
      alert(`Minimum stay is ${minStayNightsCheck} night${minStayNightsCheck !== 1 ? 's' : ''}`)
      return
    }

    if (guests > apartment.maxGuests) {
      alert(`Maximum ${apartment.maxGuests} guests allowed`)
      return
    }

    if (!pricingDetails) {
      alert('Please wait for pricing calculation')
      return
    }

    // Navigate to checkout with booking details
    const checkoutParams = new URLSearchParams({
      apartmentId: apartment.id,
      apartmentName: apartment.title,
      checkIn: selectedDateRange.from.toISOString(),
      checkOut: selectedDateRange.to.toISOString(),
      guests: guests.toString(),
      nights: nights.toString(),
      subtotal: pricingDetails.subtotal.toString(),
      discountAmount: pricingDetails.discountAmount.toString(),
      discountPercentage: pricingDetails.discountPercentage.toString(),
      serviceFee: pricingDetails.serviceFee.toString(),
      cleaningFee: pricingDetails.cleaningFee.toString(),
      totalPrice: pricingDetails.total.toString(),
      priceBreakdown: JSON.stringify(pricingDetails.priceBreakdown)
    })

    router.push(`/checkout?${checkoutParams.toString()}`)
  }

  return (
    <div className="space-y-6">
      {/* Date Selection Summary */}
      <div className="border rounded-lg p-4 cursor-pointer hover:border-blue-500 transition" 
           onClick={() => setShowCalendarModal(true)}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check-in
            </label>
            <div className="text-sm text-gray-900">
              {selectedDateRange?.from ? selectedDateRange.from.toLocaleDateString() : 'Select date'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check-out
            </label>
            <div className="text-sm text-gray-900">
              {selectedDateRange?.to ? selectedDateRange.to.toLocaleDateString() : 'Select date'}
            </div>
          </div>
        </div>
        <div className="text-center mt-2 text-sm text-blue-600">
          Click to select dates
        </div>
      </div>

      {/* Calendar Modal */}
      <CalendarModal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        onDateChange={handleDateChange}
        selectedDateRange={selectedDateRange}
        apartment={apartment}
        availabilities={availabilities}
        bookingHorizon={bookingHorizon}
      />

      {/* Guests Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Guests
        </label>
        <select
          value={guests}
          onChange={(e) => setGuests(parseInt(e.target.value))}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {Array.from({ length: apartment.maxGuests }, (_, i) => i + 1).map(num => (
            <option key={num} value={num}>
              {num} {num === 1 ? 'guest' : 'guests'}
            </option>
          ))}
        </select>
      </div>

      {/* Pricing Breakdown */}
      {nights > 0 && pricingDetails && (
        <div className="space-y-2 py-4 border-t border-gray-200">
          {loadingPrice ? (
            <div className="text-center py-4">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-600 rounded-full border-t-transparent"></div>
              <p className="text-sm text-gray-600 mt-2">Calculating price...</p>
            </div>
          ) : (
            <>
              {/* Season/Event Price Breakdown */}
              <div className="space-y-2 mb-3">
                <div className="text-sm font-semibold text-gray-700 mb-2">Preisaufschlüsselung:</div>
                {pricingDetails.priceBreakdown.map((breakdown, index) => (
                  <div key={index} className="bg-gray-50 p-2 rounded">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {breakdown.priceType} ({breakdown.dateRange})
                      </span>
                      <span className="text-gray-800">
                        {breakdown.nights} × {formatPrice(breakdown.pricePerNight)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-500">
                        {breakdown.nights} Nacht{breakdown.nights !== 1 ? 'e' : ''}
                      </span>
                      <span className="font-medium">{formatPrice(breakdown.subtotal)}</span>
                    </div>
                    {breakdown.discountApplied && breakdown.discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-green-600 mt-1">
                        <span>Rabatt ({pricingDetails.discountPercentage}%)</span>
                        <span>-{formatPrice(breakdown.discountAmount)}</span>
                      </div>
                    )}
                    {breakdown.priceType.includes('Event') && (
                      <div className="text-xs text-orange-600 mt-1">
                        * Event-Preise sind nicht rabattfähig
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Zwischensumme</span>
                  <span>{formatPrice(pricingDetails.subtotal)}</span>
                </div>
                
                {pricingDetails.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span>
                      Gesamtrabatt ({pricingDetails.discountPercentage}% für {nights} Nächte)
                    </span>
                    <span>-{formatPrice(pricingDetails.discountAmount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service-Gebühr (15%)</span>
                  <span>{formatPrice(pricingDetails.serviceFee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Reinigungsgebühr</span>
                  <span>{formatPrice(pricingDetails.cleaningFee)}</span>
                </div>
              </div>
              
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                <span>Gesamt</span>
                <span>{formatPrice(pricingDetails.total)}</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Booking Button */}
      <button
        onClick={handleBooking}
        disabled={isLoading || !selectedDateRange?.from || !selectedDateRange?.to || nights < minStayNights || !pricingDetails || loadingPrice}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
      >
        {isLoading ? 'Processing...' : nights > 0 ? `Reserve ${nights} night${nights !== 1 ? 's' : ''}` : 'Select dates'}
      </button>

      {/* Additional Info */}
      <div className="space-y-2 text-sm text-gray-500 text-center">
        {minStayNights > 1 && (
          <p>Minimum stay: {minStayNights} nights</p>
        )}
        <p>You won't be charged yet</p>
        <p>Free cancellation before check-in</p>
      </div>
    </div>
  )
}