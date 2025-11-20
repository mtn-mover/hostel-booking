'use client'

import { useState, useEffect } from 'react'
import { Calendar, Plus, X, Save, Trash2, DollarSign, Percent } from 'lucide-react'
import { format, eachDayOfInterval, isWithinInterval } from 'date-fns'
import { de } from 'date-fns/locale'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

interface SeasonPrice {
  id?: string
  name: string
  type: 'OFFICIAL' | 'HIGH_SEASON' | 'MID_SEASON' | 'LOW_SEASON'
  price: number
  startDate: string
  endDate: string
  priority: number
  isActive: boolean
}

interface EventPrice {
  id?: string
  eventName: string
  startDate: string
  endDate: string
  price: number
  isActive: boolean
}

interface DiscountRule {
  id?: string
  minNights: number
  percentage: number
  isActive: boolean
}

interface Props {
  apartmentId: string
  basePrice: number
}

export function PricingManager({ apartmentId, basePrice }: Props) {
  const [activeTab, setActiveTab] = useState<'seasons' | 'events' | 'discounts'>('seasons')
  const [seasonPrices, setSeasonPrices] = useState<SeasonPrice[]>([])
  const [eventPrices, setEventPrices] = useState<EventPrice[]>([])
  const [discountRules, setDiscountRules] = useState<DiscountRule[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load pricing data
  useEffect(() => {
    fetchPricingData()
  }, [apartmentId])

  // Check if dates overlap with existing season prices
  const isDateInSeasonRange = (date: string, excludeIndex?: number) => {
    const checkDate = new Date(date)
    return seasonPrices.some((season, index) => {
      if (excludeIndex !== undefined && index === excludeIndex) return false
      if (!season.startDate || !season.endDate) return false
      const start = new Date(season.startDate)
      const end = new Date(season.endDate)
      return checkDate >= start && checkDate <= end
    })
  }

  // Get disabled date range for input fields
  const getDisabledDates = (currentIndex: number) => {
    const blockedRanges: { start: Date; end: Date }[] = []
    seasonPrices.forEach((season, index) => {
      if (index !== currentIndex && season.startDate && season.endDate) {
        blockedRanges.push({
          start: new Date(season.startDate),
          end: new Date(season.endDate)
        })
      }
    })
    return blockedRanges
  }

  // Get occupied dates info for display
  const getOccupiedDatesInfo = (currentIndex: number) => {
    const info: string[] = []
    seasonPrices.forEach((season, index) => {
      if (index !== currentIndex && season.startDate && season.endDate && season.name) {
        const start = new Date(season.startDate).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' })
        const end = new Date(season.endDate).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' })
        info.push(`${season.name}: ${start} - ${end}`)
      }
    })
    return info
  }

  // Get all excluded dates for a specific season
  const getExcludedDates = (currentIndex: number): Date[] => {
    const excludedDates: Date[] = []
    
    seasonPrices.forEach((season, index) => {
      if (index !== currentIndex && season.startDate && season.endDate) {
        // Parse dates properly to avoid timezone issues
        const [startYear, startMonth, startDay] = season.startDate.split('-').map(Number)
        const [endYear, endMonth, endDay] = season.endDate.split('-').map(Number)
        const start = new Date(startYear, startMonth - 1, startDay, 12, 0, 0)
        const end = new Date(endYear, endMonth - 1, endDay, 12, 0, 0)
        
        // Only add dates if they're valid
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          try {
            const datesInRange = eachDayOfInterval({ start, end })
            excludedDates.push(...datesInRange)
          } catch (e) {
            console.error('Error calculating date interval:', e, season)
          }
        }
      }
    })
    
    return excludedDates
  }

  // Validate date range doesn't overlap
  const validateDateRange = (startDate: string, endDate: string, currentIndex: number) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    for (let i = 0; i < seasonPrices.length; i++) {
      if (i === currentIndex) continue
      const season = seasonPrices[i]
      if (!season.startDate || !season.endDate) continue
      
      const seasonStart = new Date(season.startDate)
      const seasonEnd = new Date(season.endDate)
      
      // Check for any overlap
      if ((start <= seasonEnd && end >= seasonStart)) {
        return false
      }
    }
    return true
  }

  const fetchPricingData = async () => {
    try {
      const response = await fetch(`/api/admin/apartments/${apartmentId}/pricing`)
      if (response.ok) {
        const data = await response.json()
        
        // Format dates for input fields
        const formattedSeasonPrices = (data.seasonPrices || []).map((season: any) => ({
          ...season,
          startDate: season.startDate ? new Date(season.startDate).toISOString().split('T')[0] : '',
          endDate: season.endDate ? new Date(season.endDate).toISOString().split('T')[0] : ''
        }))
        
        const formattedEventPrices = (data.eventPrices || []).map((event: any) => ({
          ...event,
          date: event.date ? new Date(event.date).toISOString().split('T')[0] : ''
        }))
        
        setSeasonPrices(formattedSeasonPrices)
        setEventPrices(formattedEventPrices)
        setDiscountRules(data.discountRules || [])
      }
    } catch (error) {
      console.error('Failed to fetch pricing data:', error)
    }
  }

  // Get next available date that's not blocked  
  const getNextAvailableDate = () => {
    // Start from tomorrow, not today (no past dates allowed)
    const tomorrow = new Date()
    tomorrow.setHours(0, 0, 0, 0)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    console.log('=== getNextAvailableDate called ===')
    
    // Simple approach: Find the maximum end date among all seasons
    let latestDate: Date | null = null
    
    seasonPrices.forEach((season, idx) => {
      if (season.endDate) {
        // Has end date - use it
        const endDate = new Date(season.endDate + 'T00:00:00')
        console.log(`Season ${idx} ends at: ${season.endDate}`)
        
        if (!latestDate || endDate > latestDate) {
          latestDate = endDate
        }
      } else if (season.startDate) {
        // Only has start date - use it
        const startDate = new Date(season.startDate + 'T00:00:00')
        console.log(`Season ${idx} starts at (no end): ${season.startDate}`)
        
        if (!latestDate || startDate > latestDate) {
          latestDate = startDate
        }
      }
    })
    
    // If we found a latest date, return the day after it
    if (latestDate) {
      const nextDay = new Date(latestDate)
      nextDay.setDate(nextDay.getDate() + 1)
      const result = nextDay.toISOString().split('T')[0]
      console.log(`Latest occupied date: ${latestDate.toISOString().split('T')[0]}`)
      console.log(`Next available date: ${result}`)
      return result
    }
    
    // No seasons found, return tomorrow
    const result = tomorrow.toISOString().split('T')[0]
    console.log(`No seasons found, returning tomorrow: ${result}`)
    return result
  }

  // Add new season price
  const addSeasonPrice = () => {
    console.log('=== ADD NEW SEASON BUTTON CLICKED ===')
    console.log('Current seasonPrices array:', JSON.stringify(seasonPrices, null, 2))
    
    // Calculate next available date inline to ensure it's fresh
    const tomorrow = new Date()
    tomorrow.setHours(0, 0, 0, 0)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    let nextAvailable = tomorrow.toISOString().split('T')[0]
    console.log('Starting with tomorrow as default:', nextAvailable)
    
    // Find the latest occupied date among all existing seasons
    if (seasonPrices.length > 0) {
      const allEndDates: Date[] = []
      
      seasonPrices.forEach((season, idx) => {
        console.log(`Checking season ${idx}:`, {
          name: season.name,
          start: season.startDate,
          end: season.endDate
        })
        
        if (season.endDate) {
          // Parse date carefully to avoid timezone issues
          const parts = season.endDate.split('-')
          const endDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
          endDate.setHours(0, 0, 0, 0)
          allEndDates.push(endDate)
          console.log(`  - Season ${idx} ends on: ${season.endDate} (parsed as ${endDate.toLocaleDateString('de-CH')})`)
        }
      })
      
      if (allEndDates.length > 0) {
        // Sort dates and get the latest one
        allEndDates.sort((a, b) => b.getTime() - a.getTime())
        const latestEndDate = allEndDates[0]
        console.log(`Latest end date found: ${latestEndDate.toLocaleDateString('de-CH')}`)
        
        // Add one day to get next available
        const nextDay = new Date(latestEndDate)
        nextDay.setDate(nextDay.getDate() + 1)
        
        // Format as YYYY-MM-DD
        const year = nextDay.getFullYear()
        const month = String(nextDay.getMonth() + 1).padStart(2, '0')
        const day = String(nextDay.getDate()).padStart(2, '0')
        nextAvailable = `${year}-${month}-${day}`
        
        console.log(`Next available date will be: ${nextAvailable} (day after ${latestEndDate.toLocaleDateString('de-CH')})`)
      } else {
        console.log('No seasons have end dates yet, using tomorrow')
      }
    } else {
      console.log('No existing seasons, using tomorrow')
    }
    
    console.log('FINAL next available date for new season:', nextAvailable)
    
    // Use a default price if basePrice is undefined or NaN
    const defaultPrice = 120
    const validPrice = basePrice && !isNaN(basePrice) ? basePrice : defaultPrice
    
    const newSeason: SeasonPrice = {
      name: '',
      type: 'MID_SEASON',
      price: validPrice,
      startDate: nextAvailable,
      endDate: '', // Leave end date empty
      priority: 0,
      isActive: true
    }
    
    console.log('New season object being created:', JSON.stringify(newSeason, null, 2))
    
    const updatedSeasons = [...seasonPrices, newSeason]
    
    setSeasonPrices(updatedSeasons)
    
    console.log('Total seasons after adding:', updatedSeasons.length)
    console.log('======================')
  }

  // Get next available date for events (considers both seasons and events)
  const getNextAvailableDateForEvent = () => {
    const today = new Date()
    let checkDate = new Date(today)
    
    // Check up to 1 year in the future for events
    const maxDate = new Date(today)
    maxDate.setFullYear(maxDate.getFullYear() + 1)
    
    while (checkDate <= maxDate) {
      const dateStr = checkDate.toISOString().split('T')[0]
      
      // Check if date is blocked by season
      const isBlockedBySeason = seasonPrices.some(season => {
        if (!season.startDate || !season.endDate) return false
        const start = new Date(season.startDate)
        const end = new Date(season.endDate)
        return checkDate >= start && checkDate <= end
      })
      
      // Check if date is blocked by another event
      const isBlockedByEvent = eventPrices.some(event => {
        if (!event.date) return false
        const eventDate = new Date(event.date)
        return checkDate.toDateString() === eventDate.toDateString()
      })
      
      if (!isBlockedBySeason && !isBlockedByEvent) {
        return dateStr
      }
      
      checkDate.setDate(checkDate.getDate() + 1)
    }
    
    return today.toISOString().split('T')[0]
  }

  // Add new event price
  const addEventPrice = () => {
    const today = new Date().toISOString().split('T')[0]
    const newEvent: EventPrice = {
      eventName: '',
      startDate: today,
      endDate: today,
      price: basePrice * 1.5,
      isActive: true
    }
    setEventPrices([...eventPrices, newEvent])
  }

  // Add new discount rule
  const addDiscountRule = () => {
    const newDiscount: DiscountRule = {
      minNights: 7,
      percentage: 10,
      isActive: true
    }
    setDiscountRules([...discountRules, newDiscount])
  }

  // Save all event prices
  const saveAllEvents = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/apartments/${apartmentId}/pricing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventPrices  // Only send event prices - API now handles partial updates
        })
      })

      if (response.ok) {
        await fetchPricingData()
        alert('Event prices saved successfully')
      } else {
        alert('Failed to save event prices')
      }
    } catch (error) {
      console.error('Save event prices error:', error)
      alert('Failed to save event prices')
    } finally {
      setIsLoading(false)
    }
  }

  // Save all discount rules
  const saveAllDiscounts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/apartments/${apartmentId}/pricing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discountRules  // Only send discount rules - API now handles partial updates
        })
      })

      if (response.ok) {
        await fetchPricingData()
        alert('Discount rules saved successfully')
      } else {
        alert('Failed to save discount rules')
      }
    } catch (error) {
      console.error('Save discount rules error:', error)
      alert('Failed to save discount rules')
    } finally {
      setIsLoading(false)
    }
  }

  // Save individual season
  const saveSeason = async (season: SeasonPrice, index: number) => {
    console.log('=== SAVE SEASON CALLED ===')
    console.log('Season:', season)
    console.log('Index:', index)
    console.log('Has ID?:', !!season.id)
    
    if (!season.name) {
      alert('Season is missing a name. Please add a name.')
      return
    }
    if (!season.startDate) {
      alert(`Season "${season.name}" is missing a start date.`)
      return
    }
    if (!season.endDate) {
      alert(`Season "${season.name}" is missing an end date.`)
      return
    }
    if (!validateDateRange(season.startDate, season.endDate, index)) {
      alert(`Season "${season.name}" has overlapping dates with another season.`)
      return
    }

    setIsLoading(true)
    try {
      // For new seasons without ID, we need to save all seasons including the new one
      // Update the seasonPrices array with the current season data
      const updatedSeasons = [...seasonPrices]
      updatedSeasons[index] = season
      
      console.log('Saving seasons:', updatedSeasons)
      
      const response = await fetch(`/api/admin/apartments/${apartmentId}/pricing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seasonPrices: updatedSeasons  // Send all seasons including the new/updated one
        })
      })

      if (response.ok) {
        await fetchPricingData()
        alert(`Season "${season.name}" saved successfully`)
      } else {
        const error = await response.text()
        console.error('Save error:', error)
        alert(`Failed to save season "${season.name}"`)
      }
    } catch (error) {
      console.error('Save season error:', error)
      alert(`Failed to save season "${season.name}"`)
    } finally {
      setIsLoading(false)
    }
  }

  // Save all season pricing data
  const saveAllSeasons = async () => {
    // Validate all season prices don't overlap
    for (let i = 0; i < seasonPrices.length; i++) {
      const season = seasonPrices[i]
      if (!season.name) {
        alert(`Season ${i + 1} is missing a name. Please add a name.`)
        return
      }
      if (!season.startDate) {
        alert(`Season "${season.name || `Season ${i + 1}`}" is missing a start date.`)
        return
      }
      if (!season.endDate) {
        alert(`Season "${season.name || `Season ${i + 1}`}" is missing an end date.`)
        return
      }
      if (!validateDateRange(season.startDate, season.endDate, i)) {
        alert(`Season "${season.name || `Season ${i + 1}`}" has overlapping dates with another season. Please fix this before saving.`)
        return
      }
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/apartments/${apartmentId}/pricing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seasonPrices  // Only send season prices - API now handles partial updates
        })
      })

      if (response.ok) {
        await fetchPricingData()
        alert('All seasons saved successfully')
      } else {
        alert('Failed to save pricing')
      }
    } catch (error) {
      console.error('Save pricing error:', error)
      alert('Failed to save pricing')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <style jsx global>{`
        .react-datepicker-popper {
          z-index: 50;
        }
        .react-datepicker__day--excluded {
          color: #cbd5e0 !important;
          text-decoration: line-through !important;
          cursor: not-allowed !important;
          background-color: #f7fafc !important;
        }
        .react-datepicker__day--excluded:hover {
          background-color: #f7fafc !important;
        }
        .react-datepicker__day--selected {
          background-color: #3182ce !important;
        }
        .react-datepicker__day--in-range {
          background-color: #bee3f8 !important;
          color: #2c5282 !important;
        }
        .react-datepicker__day--in-selecting-range {
          background-color: #90cdf4 !important;
        }
      `}</style>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Pricing Management</h2>
      
      {/* Base Price Display */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Official Base Price:</span>
          <span className="text-xl font-bold text-gray-900">CHF {basePrice}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-4">
        <button
          onClick={() => setActiveTab('seasons')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === 'seasons' 
              ? 'text-blue-600 border-blue-600' 
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          Season Prices
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === 'events' 
              ? 'text-blue-600 border-blue-600' 
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          Special Events
        </button>
        <button
          onClick={() => setActiveTab('discounts')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === 'discounts' 
              ? 'text-blue-600 border-blue-600' 
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          Discounts
        </button>
      </div>

      {/* Season Prices Tab */}
      {activeTab === 'seasons' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Season Pricing</h3>
            <button
              onClick={addSeasonPrice}
              className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Season
            </button>
          </div>

          {seasonPrices.map((season, index) => {
            console.log(`Rendering season ${index}:`, {
              name: season.name,
              startDate: season.startDate,
              endDate: season.endDate,
              id: season.id
            })
            return (
            <div key={season.id || index} className="border rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Season Name
                  </label>
                  <input
                    type="text"
                    value={season.name}
                    onChange={(e) => {
                      const updated = [...seasonPrices]
                      updated[index].name = e.target.value
                      setSeasonPrices(updated)
                    }}
                    placeholder="e.g., Summer High Season"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={season.type}
                    onChange={(e) => {
                      const updated = [...seasonPrices]
                      updated[index].type = e.target.value as SeasonPrice['type']
                      setSeasonPrices(updated)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="HIGH_SEASON">High Season</option>
                    <option value="MID_SEASON">Mid Season</option>
                    <option value="LOW_SEASON">Low Season</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Price (CHF)
                  </label>
                  <input
                    type="number"
                    value={season.price || 0}
                    onChange={(e) => {
                      const updated = [...seasonPrices]
                      updated[index].price = parseFloat(e.target.value)
                      setSeasonPrices(updated)
                    }}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <DatePicker
                    selected={(() => {
                      if (season.startDate) {
                        // Parse the date string properly to avoid timezone issues
                        const [year, month, day] = season.startDate.split('-').map(Number)
                        const date = new Date(year, month - 1, day, 12, 0, 0) // Use noon to avoid DST issues
                        console.log(`Season ${index} start date: ${season.startDate} -> ${date.toLocaleDateString('de-CH')}`)
                        return date
                      }
                      return null
                    })()}
                    onChange={(date: Date | null) => {
                      if (date) {
                        // Ensure we get the correct local date
                        const year = date.getFullYear()
                        const month = String(date.getMonth() + 1).padStart(2, '0')
                        const day = String(date.getDate()).padStart(2, '0')
                        const newDate = `${year}-${month}-${day}`
                        
                        console.log(`Season ${index} - Start date changed:`, {
                          selected: date.toLocaleDateString('de-CH'),
                          formatted: newDate,
                          endDate: season.endDate
                        })
                        
                        if (season.endDate && newDate > season.endDate) {
                          alert('Start date cannot be after end date.')
                          return
                        }
                        const updated = [...seasonPrices]
                        updated[index].startDate = newDate
                        setSeasonPrices(updated)
                      }
                    }}
                    excludeDates={getExcludedDates(index)}
                    selectsStart
                    startDate={season.startDate ? (() => {
                      const [year, month, day] = season.startDate.split('-').map(Number)
                      return new Date(year, month - 1, day, 12, 0, 0)
                    })() : undefined}
                    endDate={season.endDate ? (() => {
                      const [year, month, day] = season.endDate.split('-').map(Number)
                      return new Date(year, month - 1, day, 12, 0, 0)
                    })() : undefined}
                    openToDate={(() => {
                      // Always open to the selected date if it exists
                      if (season.startDate) {
                        const [year, month, day] = season.startDate.split('-').map(Number)
                        const selectedDate = new Date(year, month - 1, day, 12, 0, 0)
                        console.log(`Season ${index} - Opening calendar to selected date: ${season.startDate}`)
                        return selectedDate
                      }
                      
                      // Fallback to today
                      const today = new Date()
                      console.log(`Season ${index} - Opening calendar to today: ${today.toLocaleDateString('de-CH')}`)
                      return today
                    })()}
                    minDate={(() => {
                      // Always set minimum date to tomorrow (no past dates allowed)
                      const tomorrow = new Date()
                      tomorrow.setHours(0, 0, 0, 0)
                      tomorrow.setDate(tomorrow.getDate() + 1)
                      
                      // Find the latest end date from ALL previous seasons (not just those before this index)
                      let minDate = tomorrow
                      
                      // Check all seasons for their end dates
                      seasonPrices.forEach((prevSeason, idx) => {
                        // Skip the current season we're editing
                        if (idx === index) return
                        
                        if (prevSeason.endDate) {
                          const endDate = new Date(prevSeason.endDate)
                          const dayAfterEnd = new Date(endDate)
                          dayAfterEnd.setDate(dayAfterEnd.getDate() + 1)
                          
                          // Use the latest end date + 1 as minimum
                          if (dayAfterEnd > minDate) {
                            minDate = dayAfterEnd
                          }
                        }
                      })
                      
                      console.log(`Season ${index} - minDate set to: ${minDate.toISOString().split('T')[0]}`)
                      return minDate
                    })()}
                    dateFormat="dd.MM.yyyy"
                    locale={de}
                    placeholderText="Select start date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    calendarClassName="custom-calendar"
                    dayClassName={(date) => {
                      const isExcluded = getExcludedDates(index).some(
                        excludedDate => excludedDate.toDateString() === date.toDateString()
                      )
                      return isExcluded ? 'text-gray-400 line-through' : undefined
                    }}
                  />
                  {/* Show occupied dates info */}
                  {getOccupiedDatesInfo(index).length > 0 && (
                    <p className="text-gray-500 text-xs mt-1">
                      Blocked: {getOccupiedDatesInfo(index).join(', ')}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <DatePicker
                    selected={(() => {
                      if (season.endDate) {
                        // Parse the date string properly to avoid timezone issues
                        const [year, month, day] = season.endDate.split('-').map(Number)
                        const date = new Date(year, month - 1, day, 12, 0, 0) // Use noon to avoid DST issues
                        console.log(`Season ${index} end date: ${season.endDate} -> ${date.toLocaleDateString('de-CH')}`)
                        return date
                      }
                      return null
                    })()}
                    onChange={(date: Date | null) => {
                      if (date) {
                        // Ensure we get the correct local date
                        const year = date.getFullYear()
                        const month = String(date.getMonth() + 1).padStart(2, '0')
                        const day = String(date.getDate()).padStart(2, '0')
                        const newDate = `${year}-${month}-${day}`
                        
                        console.log(`Season ${index} - End date changed:`, {
                          selected: date.toLocaleDateString('de-CH'),
                          formatted: newDate,
                          startDate: season.startDate
                        })
                        
                        const updated = [...seasonPrices]
                        updated[index].endDate = newDate
                        setSeasonPrices(updated)
                      }
                    }}
                    excludeDates={getExcludedDates(index)}
                    selectsEnd
                    startDate={season.startDate ? (() => {
                      const [year, month, day] = season.startDate.split('-').map(Number)
                      return new Date(year, month - 1, day, 12, 0, 0)
                    })() : undefined}
                    endDate={season.endDate ? (() => {
                      const [year, month, day] = season.endDate.split('-').map(Number)
                      return new Date(year, month - 1, day, 12, 0, 0)
                    })() : undefined}
                    minDate={season.startDate ? (() => {
                      const [year, month, day] = season.startDate.split('-').map(Number)
                      return new Date(year, month - 1, day, 12, 0, 0)
                    })() : undefined}
                    openToDate={(() => {
                      // If end date is already selected, open to that date
                      if (season.endDate) {
                        const [year, month, day] = season.endDate.split('-').map(Number)
                        return new Date(year, month - 1, day, 12, 0, 0)
                      }
                      // If start date exists, open to start date or next available after it
                      if (season.startDate) {
                        const [year, month, day] = season.startDate.split('-').map(Number)
                        const startDate = new Date(year, month - 1, day, 12, 0, 0)
                        let checkDate = new Date(startDate)
                        checkDate.setDate(checkDate.getDate() + 1) // Start from day after start date
                        const maxDate = new Date(startDate)
                        maxDate.setFullYear(maxDate.getFullYear() + 1)
                        
                        while (checkDate <= maxDate) {
                          const isBlocked = seasonPrices.some((s, idx) => {
                            if (idx === index || !s.startDate || !s.endDate) return false
                            const start = new Date(s.startDate)
                            const end = new Date(s.endDate)
                            return checkDate >= start && checkDate <= end
                          })
                          
                          if (!isBlocked) {
                            return checkDate
                          }
                          
                          checkDate.setDate(checkDate.getDate() + 1)
                        }
                        
                        return startDate
                      }
                      // Default to today if no start date
                      return new Date()
                    })()}
                    dateFormat="dd.MM.yyyy"
                    locale={de}
                    placeholderText="Select end date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    calendarClassName="custom-calendar"
                    dayClassName={(date) => {
                      const isExcluded = getExcludedDates(index).some(
                        excludedDate => excludedDate.toDateString() === date.toDateString()
                      )
                      return isExcluded ? 'text-gray-400 line-through' : undefined
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={season.isActive}
                    onChange={(e) => {
                      const updated = [...seasonPrices]
                      updated[index].isActive = e.target.checked
                      setSeasonPrices(updated)
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">Active</span>
                </label>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => saveSeason(season, index)}
                    disabled={isLoading}
                    className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 text-xs"
                  >
                    <Save className="w-3 h-3" />
                    {season.id ? 'Save' : 'Create'}
                  </button>
                  <button
                    onClick={() => {
                      setSeasonPrices(seasonPrices.filter((_, i) => i !== index))
                    }}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )})}
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h3 className="font-medium">Special Event Pricing</h3>
              <p className="text-xs text-gray-500 mt-1">
                ⚠️ Event prices override all season prices and discounts are not applied
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={addEventPrice}
                className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Event
              </button>
              {eventPrices.length > 0 && (
                <button
                  onClick={saveAllEvents}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 text-sm"
                >
                  <Save className="w-4 h-4" />
                  Save All Events
                </button>
              )}
            </div>
          </div>

          {eventPrices.map((event, index) => (
            <div key={event.id || index} className="border rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Event Name
                  </label>
                  <input
                    type="text"
                    value={event.eventName}
                    onChange={(e) => {
                      const updated = [...eventPrices]
                      updated[index].eventName = e.target.value
                      setEventPrices(updated)
                    }}
                    placeholder="e.g., Christmas"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Price (CHF)
                  </label>
                  <input
                    type="number"
                    value={event.price}
                    onChange={(e) => {
                      const updated = [...eventPrices]
                      updated[index].price = parseFloat(e.target.value)
                      setEventPrices(updated)
                    }}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={event.startDate}
                    onChange={(e) => {
                      const updated = [...eventPrices]
                      updated[index].startDate = e.target.value
                      // Auto-set end date to same as start if empty
                      if (!updated[index].endDate) {
                        updated[index].endDate = e.target.value
                      }
                      setEventPrices(updated)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={event.endDate}
                    onChange={(e) => {
                      const updated = [...eventPrices]
                      updated[index].endDate = e.target.value
                      setEventPrices(updated)
                    }}
                    min={event.startDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  {/* Show if dates override seasons */}
                  {event.startDate && event.endDate && (() => {
                    const overriddenSeasons = new Set<string>()
                    const start = new Date(event.startDate)
                    const end = new Date(event.endDate)
                    
                    seasonPrices.forEach(season => {
                      if (!season.startDate || !season.endDate) return
                      const seasonStart = new Date(season.startDate)
                      const seasonEnd = new Date(season.endDate)
                      
                      // Check if event overlaps with season (end dates are exclusive)
                      // Event overlaps if: eventStart < seasonEnd AND eventEnd > seasonStart
                      if (start < seasonEnd && end > seasonStart) {
                        overriddenSeasons.add(`${season.name} (CHF ${season.price})`)
                      }
                    })
                    
                    if (overriddenSeasons.size > 0) {
                      return (
                        <p className="text-orange-600 text-xs mt-1">
                          ⚠️ Overrides: {Array.from(overriddenSeasons).join(', ')}
                        </p>
                      )
                    }
                    return null
                  })()}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={event.isActive}
                    onChange={(e) => {
                      const updated = [...eventPrices]
                      updated[index].isActive = e.target.checked
                      setEventPrices(updated)
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">Active</span>
                </label>
                
                <button
                  onClick={() => {
                    setEventPrices(eventPrices.filter((_, i) => i !== index))
                  }}
                  className="text-red-600 hover:text-red-700 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Discounts Tab */}
      {activeTab === 'discounts' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h3 className="font-medium">Length of Stay Discounts</h3>
              <p className="text-xs text-gray-500 mt-1">
                ℹ️ Discounts apply only to base and season prices, not to event prices
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={addDiscountRule}
                className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Discount
              </button>
              {discountRules.length > 0 && (
                <button
                  onClick={saveAllDiscounts}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 text-sm"
                >
                  <Save className="w-4 h-4" />
                  Save All Discounts
                </button>
              )}
            </div>
          </div>

          {discountRules
            .sort((a, b) => a.minNights - b.minNights)
            .map((discount, index) => (
              <div key={discount.id || index} className="border rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Minimum Nights
                    </label>
                    <input
                      type="number"
                      value={discount.minNights}
                      onChange={(e) => {
                        const updated = [...discountRules]
                        updated[index].minNights = parseInt(e.target.value)
                        setDiscountRules(updated)
                      }}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      value={discount.percentage}
                      onChange={(e) => {
                        const updated = [...discountRules]
                        updated[index].percentage = parseFloat(e.target.value)
                        setDiscountRules(updated)
                      }}
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={discount.isActive}
                        onChange={(e) => {
                          const updated = [...discountRules]
                          updated[index].isActive = e.target.checked
                          setDiscountRules(updated)
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">Active</span>
                    </label>
                    
                    <span className="text-sm text-gray-500">
                      Book {discount.minNights}+ nights, get {discount.percentage}% off
                    </span>
                  </div>
                  
                  <button
                    onClick={() => {
                      setDiscountRules(discountRules.filter((_, i) => i !== index))
                    }}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

          {/* Discount Preview */}
          {discountRules.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Active Discount Structure:</h4>
              <div className="space-y-1">
                {discountRules
                  .filter(d => d.isActive)
                  .sort((a, b) => a.minNights - b.minNights)
                  .map((discount, i) => (
                    <div key={i} className="text-sm text-blue-700">
                      • {discount.minNights}+ nights: {discount.percentage}% off
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Season Button at bottom - Only show in seasons tab */}
      {activeTab === 'seasons' && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={addSeasonPrice}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Season
          </button>
        </div>
      )}
    </div>
    </>
  )
}