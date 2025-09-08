'use client'

import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isBefore, startOfDay, isWithinInterval } from 'date-fns'
import { de } from 'date-fns/locale'

interface CalendarModalProps {
  isOpen: boolean
  onClose: () => void
  onDateChange: (range: DateRange | undefined) => void
  selectedDateRange?: DateRange
  apartment: {
    price: number
  }
  availabilities?: Array<{
    date: Date
    status: string
    priceOverride: number | null
  }>
  bookingHorizon?: string
}

export function CalendarModal({ isOpen, onClose, onDateChange, selectedDateRange, apartment, availabilities = [], bookingHorizon }: CalendarModalProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [localRange, setLocalRange] = useState<DateRange | undefined>(selectedDateRange)
  const [isSelecting, setIsSelecting] = useState(false)

  useEffect(() => {
    setLocalRange(selectedDateRange)
  }, [selectedDateRange])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const nextMonth = addMonths(currentMonth, 1)

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const handleDateClick = (date: Date) => {
    const today = startOfDay(new Date())
    
    // Don't allow selection of past dates
    if (isBefore(date, today)) return
    
    // Don't allow selection beyond booking horizon
    if (bookingHorizon) {
      const horizonDate = new Date(bookingHorizon + 'T23:59:59')
      if (date > horizonDate) return
    }
    
    // Check if date is available
    const availability = availabilities.find(a => 
      startOfDay(new Date(a.date)).getTime() === startOfDay(date).getTime()
    )
    
    if (availability && availability.status === 'booked') return

    if (!localRange?.from || (localRange.from && localRange.to)) {
      // Start new selection
      setLocalRange({ from: date, to: undefined })
      setIsSelecting(true)
    } else {
      // Complete selection
      if (isBefore(date, localRange.from)) {
        setLocalRange({ from: date, to: localRange.from })
      } else {
        setLocalRange({ from: localRange.from, to: date })
      }
      setIsSelecting(false)
    }
  }
  
  const getPriceForDate = (date: Date) => {
    const availability = availabilities.find(a => 
      startOfDay(new Date(a.date)).getTime() === startOfDay(date).getTime()
    )
    return availability?.priceOverride || apartment.price
  }
  
  const isDateBooked = (date: Date) => {
    const availability = availabilities.find(a => 
      startOfDay(new Date(a.date)).getTime() === startOfDay(date).getTime()
    )
    return availability?.status === 'booked'
  }

  const handleApply = () => {
    onDateChange(localRange)
    onClose()
  }

  const handleClear = () => {
    setLocalRange(undefined)
    setIsSelecting(false)
  }

  const renderMonth = (month: Date) => {
    const start = startOfMonth(month)
    const end = endOfMonth(month)
    const days = eachDayOfInterval({ start, end })
    const today = startOfDay(new Date())

    // Get the first day of the week (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = start.getDay()
    const emptyDays = Array.from({ length: firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1 }, (_, i) => i)

    return (
      <div className="flex-1">
        <h3 className="text-center font-semibold mb-4">
          {format(month, 'MMMM yyyy', { locale: de })}
        </h3>
        
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for alignment */}
          {emptyDays.map(i => (
            <div key={`empty-${i}`} className="h-14" />
          ))}
          
          {/* Day cells */}
          {days.map(day => {
            const isPast = isBefore(day, today)
            const isBooked = isDateBooked(day)
            
            // Check if date is beyond booking horizon
            const isBeyondHorizon = bookingHorizon ? (() => {
              // Parse the booking horizon date string properly
              const horizonDate = new Date(bookingHorizon + 'T23:59:59')
              return day > horizonDate
            })() : false
            
            const isUnavailable = isPast || isBooked || isBeyondHorizon
            
            const isSelected = localRange?.from && localRange?.to && 
              isWithinInterval(day, { start: localRange.from, end: localRange.to })
            const isStart = localRange?.from && day.getTime() === localRange.from.getTime()
            const isEnd = localRange?.to && day.getTime() === localRange.to.getTime()
            const isInRange = localRange?.from && localRange?.to && 
              day > localRange.from && day < localRange.to
            const isTodayDate = isToday(day)
            const dayPrice = getPriceForDate(day)

            return (
              <div
                key={day.toISOString()}
                className="relative"
              >
                <button
                  onClick={() => handleDateClick(day)}
                  disabled={isUnavailable}
                  className={`
                    w-full h-14 rounded-lg text-xs transition-all flex flex-col items-center justify-center p-1
                    ${isUnavailable ? 'cursor-not-allowed' : 'hover:bg-blue-50 cursor-pointer'}
                    ${isPast ? 'text-gray-300 bg-gray-50' : ''}
                    ${isBooked ? 'bg-red-50 text-red-300 line-through' : ''}
                    ${isBeyondHorizon ? 'text-gray-300 bg-gray-50' : ''}
                    ${isStart || isEnd ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                    ${isInRange ? 'bg-blue-100 text-blue-900' : ''}
                    ${isTodayDate && !isSelected && !isPast && !isBooked && !isBeyondHorizon ? 'ring-1 ring-blue-400' : ''}
                    ${!isPast && !isBooked && !isBeyondHorizon && !isSelected && !isInRange ? 'text-gray-700' : ''}
                  `}
                >
                  <span className="font-semibold text-sm">{format(day, 'd')}</span>
                  {!isPast && !isBooked && !isBeyondHorizon && (
                    <span className={`text-[10px] ${isStart || isEnd ? 'text-white/90' : 'text-gray-500'}`}>
                      CHF {dayPrice}
                    </span>
                  )}
                  {isBooked && (
                    <span className="text-[10px] text-red-400">
                      Belegt
                    </span>
                  )}
                  {isBeyondHorizon && !isPast && (
                    <span className="text-[10px] text-gray-400">
                      -
                    </span>
                  )}
                </button>
              </div>
            )
          })}
        </div>

      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[calc(100vh-2rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <h2 className="text-xl font-semibold">Reisedaten auswählen</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between px-6 py-3 flex-shrink-0">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="text-sm text-gray-600">
            {localRange?.from && localRange?.to && (
              <span>
                {format(localRange.from, 'dd.MM.yyyy')} - {format(localRange.to, 'dd.MM.yyyy')}
              </span>
            )}
            {localRange?.from && !localRange?.to && (
              <span>Check-in: {format(localRange.from, 'dd.MM.yyyy')}</span>
            )}
            {!localRange?.from && (
              <span>Wählen Sie Check-in und Check-out</span>
            )}
          </div>

          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Two-month calendar view */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex gap-8 px-6 pb-4">
            {renderMonth(currentMonth)}
            {renderMonth(nextMonth)}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50 flex-shrink-0">
          <button
            onClick={handleClear}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition"
          >
            Daten löschen
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            >
              Abbrechen
            </button>
            <button
              onClick={handleApply}
              disabled={!localRange?.from || !localRange?.to}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              Daten übernehmen
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}