'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DateRange } from 'react-day-picker'
import { formatPrice, calculateNights, getDiscountForNights, calculateDiscountedPrice } from '@/lib/utils'
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

export function BookingForm({ apartment, availabilities, bookingHorizon }: BookingFormProps) {
  const router = useRouter()
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>()
  const [basePrice, setBasePrice] = useState(0)
  const [guests, setGuests] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [showCalendarModal, setShowCalendarModal] = useState(false)
  
  const minStayNights = 1 // Default minimum stay

  const nights = selectedDateRange?.from && selectedDateRange?.to 
    ? calculateNights(selectedDateRange.from, selectedDateRange.to)
    : 0
  
  // Calculate base price with discount
  const discountedBasePrice = nights > 0 
    ? calculateDiscountedPrice(apartment.price, nights)
    : basePrice
  
  // Calculate additional fees
  const serviceFee = discountedBasePrice * 0.15 // 15% service fee
  const cleaningFee = 50 // Fixed cleaning fee
  const totalPrice = discountedBasePrice + serviceFee + cleaningFee
  
  // Get discount info for display
  const discount = getDiscountForNights(nights)
  const originalPrice = apartment.price * nights
  const savings = originalPrice - discountedBasePrice

  const handleDateChange = (range: DateRange | undefined) => {
    setSelectedDateRange(range)
  }

  const handlePriceChange = (price: number) => {
    setBasePrice(price)
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

    // Navigate to checkout with booking details
    const checkoutParams = new URLSearchParams({
      apartmentId: apartment.id,
      apartmentName: apartment.title,
      checkIn: selectedDateRange.from.toISOString(),
      checkOut: selectedDateRange.to.toISOString(),
      guests: guests.toString(),
      nights: nights.toString(),
      basePrice: discountedBasePrice.toString(),
      originalPrice: originalPrice.toString(),
      discount: (discount * 100).toString(),
      savings: savings.toString(),
      serviceFee: serviceFee.toString(),
      cleaningFee: cleaningFee.toString(),
      totalPrice: totalPrice.toString()
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
      {nights > 0 && (
        <div className="space-y-2 py-4 border-t border-gray-200">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              {formatPrice(apartment.price)} × {nights} Nacht{nights !== 1 ? 'e' : ''}
            </span>
            <span>{formatPrice(originalPrice)}</span>
          </div>
          
          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-600 font-medium">
              <span>
                Rabatt ({Math.round(discount * 100)}% für {nights} Nächte)
              </span>
              <span>-{formatPrice(savings)}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-gray-600">
              Unterkunft ({nights} Nacht{nights !== 1 ? 'e' : ''})
            </span>
            <span className="font-medium">{formatPrice(discountedBasePrice)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Service-Gebühr (15%)</span>
            <span>{formatPrice(serviceFee)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Reinigungsgebühr</span>
            <span>{formatPrice(cleaningFee)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
            <span>Gesamt</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
        </div>
      )}

      {/* Booking Button */}
      <button
        onClick={handleBooking}
        disabled={isLoading || !selectedDateRange?.from || !selectedDateRange?.to || nights < minStayNights}
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