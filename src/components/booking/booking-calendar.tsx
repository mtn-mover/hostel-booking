'use client'

import { useState, useEffect } from 'react'
import { DayPicker, DateRange } from 'react-day-picker'
import { formatPrice, calculateNights, getDiscountForNights, calculateDiscountedPrice } from '@/lib/utils'
import 'react-day-picker/dist/style.css'

interface BookingCalendarProps {
  apartment: {
    id: string
    title: string
    price: number
    maxGuests: number
    bedrooms: number
    bathrooms: number
  }
  onDateChange: (range: DateRange | undefined) => void
  onPriceChange: (price: number) => void
}

interface AvailabilityData {
  date: string
  isAvailable: boolean
  status: string
  price: number
  reason?: string
}

export function BookingCalendar({ apartment, onDateChange, onPriceChange }: BookingCalendarProps) {
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>()
  const [availabilityData, setAvailabilityData] = useState<AvailabilityData[]>([])
  const [loading, setLoading] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Fetch availability data for the current month view
  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true)
      try {
        // Get start and end of current month view (with some buffer)
        const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
        const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 2, 0)

        const response = await fetch(
          `/api/apartments/${apartment.id}/availability?` +
          `startDate=${startDate.toISOString().split('T')[0]}&` +
          `endDate=${endDate.toISOString().split('T')[0]}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch availability')
        }

        const data = await response.json()
        setAvailabilityData(data.availability || [])
      } catch (error) {
        console.error('Error fetching availability:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAvailability()
  }, [currentMonth, apartment.id])

  // Create a map for quick availability lookup
  const availabilityMap = availabilityData.reduce((acc, item) => {
    acc[item.date] = item
    return acc
  }, {} as Record<string, AvailabilityData>)

  // Check if a date is available
  const isDateAvailable = (date: Date): boolean => {
    const dateString = date.toISOString().split('T')[0]
    const availability = availabilityMap[dateString]
    return availability ? availability.isAvailable : true
  }

  // Get disabled dates (past dates and unavailable dates)
  const disabledDates = [
    // Past dates
    { before: new Date() },
    // Unavailable dates
    ...availabilityData
      .filter(item => !item.isAvailable)
      .map(item => new Date(item.date))
  ]

  // Handle date selection
  const handleDateSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      // Check if all dates in range are available
      const nights = calculateNights(range.from, range.to)

      // Check availability for each night
      const current = new Date(range.from)
      let allAvailable = true
      let baseNightlyPrice = apartment.price

      while (current < range.to) {
        const dateString = current.toISOString().split('T')[0]
        const availability = availabilityMap[dateString]
        
        if (!availability?.isAvailable) {
          allAvailable = false
          break
        }
        
        // Use override price if available, otherwise base price
        if (availability?.price) {
          baseNightlyPrice = availability.price
        }
        
        current.setDate(current.getDate() + 1)
      }

      if (!allAvailable) {
        alert('Some dates in your selection are not available. Please choose different dates.')
        return
      }

      // Calculate total price with discount
      const totalPrice = calculateDiscountedPrice(baseNightlyPrice, nights)

      setSelectedRange(range)
      onDateChange(range)
      onPriceChange(totalPrice)
    } else {
      setSelectedRange(range)
      onDateChange(range)
      onPriceChange(0)
    }
  }

  // Custom day content to show pricing
  const renderDay = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    const availability = availabilityMap[dateString]
    
    // Calculate price for this specific date
    let dayPrice = apartment.price
    if (availability?.price) {
      dayPrice = availability.price
    }
    
    // Determine if this is a special price day
    const isHighPrice = dayPrice > apartment.price
    const isLowPrice = dayPrice < apartment.price
    
    return (
      <div className="flex flex-col items-center justify-center h-full w-full">
        <div className="text-sm font-bold text-gray-900">{date.getDate()}</div>
        <div className={`text-xs font-bold mt-1 ${
          !availability?.isAvailable ? 'text-red-500' :
          isHighPrice ? 'text-red-600' : 
          isLowPrice ? 'text-green-600' : 
          'text-blue-700'
        }`}>
          {!availability?.isAvailable ? 'X' : `${Math.round(dayPrice)}.-`}
        </div>
      </div>
    )
  }

  // Custom modifiers for styling
  const modifiers = {
    available: (date: Date) => isDateAvailable(date),
    unavailable: (date: Date) => !isDateAvailable(date),
    today: new Date(),
    selected: selectedRange
  }

  const modifiersStyles = {
    available: {
      backgroundColor: '#f0f9ff',
      color: '#1e40af'
    },
    unavailable: {
      backgroundColor: '#fee2e2',
      color: '#dc2626',
      textDecoration: 'line-through'
    },
    today: {
      fontWeight: 'bold',
      border: '2px solid #3b82f6'
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Select your dates
          </h3>
          {loading && (
            <div className="text-sm text-gray-500">Loading availability...</div>
          )}
        </div>

        <DayPicker
          mode="range"
          selected={selectedRange}
          onSelect={handleDateSelect}
          disabled={disabledDates}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          numberOfMonths={2}
          className="rdp-custom"
          formatters={{
            formatDay: (date) => {
              const dateString = date.toISOString().split('T')[0]
              const availability = availabilityMap[dateString]
              let dayPrice = apartment.price
              if (availability?.price) {
                dayPrice = availability.price
              }
              return `${date.getDate()}\n${Math.round(dayPrice)}.-`
            }
          }}
        />

        {/* Legend */}
        <div className="mt-4 space-y-2">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
              <span>Verfügbar</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
              <span>Belegt</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded"></div>
              <span>Ausgewählt</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-red-600 font-medium">●</span>
              <span>Erhöhte Preise (Events)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-medium">●</span>
              <span>Reduzierte Preise</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-medium">●</span>
              <span>Normalpreise</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selection Summary */}
      {selectedRange?.from && selectedRange?.to && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Selected Dates</h4>
          <div className="space-y-1 text-sm text-blue-800">
            <div>
              <strong>Check-in:</strong> {selectedRange.from.toLocaleDateString()}
            </div>
            <div>
              <strong>Check-out:</strong> {selectedRange.to.toLocaleDateString()}
            </div>
            <div>
              <strong>Nights:</strong> {calculateNights(selectedRange.from, selectedRange.to)}
            </div>
          </div>
        </div>
      )}

      {/* Minimum Stay Notice */}
      {1 > 1 && (
        <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
          <strong>Note:</strong> Minimum stay is 1 nights
        </div>
      )}
    </div>
  )
}