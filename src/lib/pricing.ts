import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay } from 'date-fns'

interface PriceCalculation {
  date: Date
  basePrice: number
  appliedPrice: number
  priceType: 'OFFICIAL' | 'HIGH_SEASON' | 'MID_SEASON' | 'LOW_SEASON' | 'SPECIAL_EVENT'
  discountPercentage: number
  finalPrice: number
  source?: string
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

/**
 * Get the price for a specific date considering all pricing rules
 */
export async function getPriceForDate(
  apartmentId: string,
  date: Date,
  basePrice: number
): Promise<number> {
  // Format date as string for SQLite comparison (YYYY-MM-DD) - use local date to avoid timezone issues
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const dateStr = `${year}-${month}-${day}`
  
  // Check for special event price first (highest priority)
  // End date is exclusive (like check-out)
  const eventPrice = await prisma.eventPrice.findFirst({
    where: {
      apartmentId,
      startDate: { lte: dateStr },
      endDate: { gt: dateStr },  // Exclusive end date
      isActive: true
    }
  })

  if (eventPrice) {
    return eventPrice.price
  }

  // Check for season prices
  // End date is exclusive (like check-out)
  const seasonPrice = await prisma.seasonPrice.findFirst({
    where: {
      apartmentId,
      startDate: { lte: dateStr },
      endDate: { gt: dateStr },  // Exclusive end date
      isActive: true
    },
    orderBy: {
      priority: 'desc' // Higher priority wins
    }
  })

  if (seasonPrice) {
    return seasonPrice.price
  }

  // Return base price if no special pricing found
  return basePrice
}

/**
 * Get detailed price information for a specific date
 */
async function getPriceInfoForDate(
  apartmentId: string,
  date: Date,
  basePrice: number
): Promise<{
  price: number
  type: 'OFFICIAL' | 'HIGH_SEASON' | 'MID_SEASON' | 'LOW_SEASON' | 'SPECIAL_EVENT'
  source: string
  isEvent: boolean
}> {
  // Format date as string for SQLite comparison
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const dateStr = `${year}-${month}-${day}`
  
  // Check for special event price first (highest priority)
  const eventPrice = await prisma.eventPrice.findFirst({
    where: {
      apartmentId,
      startDate: { lte: dateStr },
      endDate: { gt: dateStr },
      isActive: true
    }
  })

  if (eventPrice) {
    return {
      price: eventPrice.price,
      type: 'SPECIAL_EVENT',
      source: eventPrice.eventName,
      isEvent: true
    }
  }

  // Check for season prices
  const seasonPrice = await prisma.seasonPrice.findFirst({
    where: {
      apartmentId,
      startDate: { lte: dateStr },
      endDate: { gt: dateStr },
      isActive: true
    },
    orderBy: {
      priority: 'desc'
    }
  })

  if (seasonPrice) {
    return {
      price: seasonPrice.price,
      type: seasonPrice.type as any,
      source: seasonPrice.name,
      isEvent: false
    }
  }

  // Return base price if no special pricing found
  return {
    price: basePrice,
    type: 'OFFICIAL',
    source: 'Standard Rate',
    isEvent: false
  }
}

/**
 * Calculate total price for a date range with discounts
 */
export async function calculateTotalPrice(
  apartmentId: string,
  checkIn: Date,
  checkOut: Date,
  basePrice: number
): Promise<{
  nights: number
  pricePerNight: number[]
  priceBreakdown: PriceBreakdown[]
  subtotal: number
  discountPercentage: number
  discountAmount: number
  cleaningFee: number
  serviceFee: number
  total: number
}> {
  // Calculate number of nights
  const nights = Math.ceil(
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
  )

  // Get price info for each night
  const pricePerNight: number[] = []
  const dailyPriceInfo: Array<{
    date: Date
    price: number
    type: string
    source: string
    isEvent: boolean
  }> = []

  const currentDate = new Date(checkIn)
  while (currentDate < checkOut) {
    const priceInfo = await getPriceInfoForDate(apartmentId, currentDate, basePrice)
    pricePerNight.push(priceInfo.price)
    dailyPriceInfo.push({
      date: new Date(currentDate),
      price: priceInfo.price,
      type: priceInfo.type,
      source: priceInfo.source,
      isEvent: priceInfo.isEvent
    })
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Get applicable discount based on number of nights
  const discountRule = await prisma.discountRule.findFirst({
    where: {
      apartmentId,
      minNights: { lte: nights },
      isActive: true
    },
    orderBy: {
      minNights: 'desc'
    }
  })

  const discountPercentage = discountRule?.percentage || 0

  // Group consecutive dates with same price type
  const priceBreakdown: PriceBreakdown[] = []
  let currentGroup: typeof dailyPriceInfo[0][] = []
  
  for (let i = 0; i < dailyPriceInfo.length; i++) {
    const current = dailyPriceInfo[i]
    
    if (currentGroup.length === 0 || 
        (currentGroup[0].type === current.type && 
         currentGroup[0].source === current.source)) {
      currentGroup.push(current)
    } else {
      // Process the completed group
      if (currentGroup.length > 0) {
        const groupSubtotal = currentGroup.reduce((sum, d) => sum + d.price, 0)
        const isEventGroup = currentGroup[0].isEvent
        const groupDiscount = isEventGroup ? 0 : (groupSubtotal * discountPercentage) / 100
        
        priceBreakdown.push({
          dateRange: formatDateRange(currentGroup[0].date, currentGroup[currentGroup.length - 1].date),
          nights: currentGroup.length,
          priceType: currentGroup[0].source,
          pricePerNight: currentGroup[0].price,
          subtotal: groupSubtotal,
          discountApplied: !isEventGroup && discountPercentage > 0,
          discountAmount: groupDiscount,
          total: groupSubtotal - groupDiscount
        })
      }
      
      // Start new group
      currentGroup = [current]
    }
  }
  
  // Process the last group
  if (currentGroup.length > 0) {
    const groupSubtotal = currentGroup.reduce((sum, d) => sum + d.price, 0)
    const isEventGroup = currentGroup[0].isEvent
    const groupDiscount = isEventGroup ? 0 : (groupSubtotal * discountPercentage) / 100
    
    priceBreakdown.push({
      dateRange: formatDateRange(currentGroup[0].date, currentGroup[currentGroup.length - 1].date),
      nights: currentGroup.length,
      priceType: currentGroup[0].source,
      pricePerNight: currentGroup[0].price,
      subtotal: groupSubtotal,
      discountApplied: !isEventGroup && discountPercentage > 0,
      discountAmount: groupDiscount,
      total: groupSubtotal - groupDiscount
    })
  }

  // Calculate totals
  const subtotal = priceBreakdown.reduce((sum, pb) => sum + pb.subtotal, 0)
  const totalDiscountAmount = priceBreakdown.reduce((sum, pb) => sum + pb.discountAmount, 0)

  // Get apartment for fees
  const apartment = await prisma.apartment.findUnique({
    where: { id: apartmentId },
    select: { cleaningFee: true }
  })

  const cleaningFee = apartment?.cleaningFee || 50
  const serviceFee = (subtotal - totalDiscountAmount) * 0.15 // 15% service fee

  const total = subtotal - totalDiscountAmount + cleaningFee + serviceFee

  return {
    nights,
    pricePerNight,
    priceBreakdown,
    subtotal,
    discountPercentage,
    discountAmount: totalDiscountAmount,
    cleaningFee,
    serviceFee,
    total
  }
}

/**
 * Format date range for display
 */
function formatDateRange(startDate: Date, endDate: Date): string {
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
  const start = startDate.toLocaleDateString('de-DE', options)
  const end = endDate.toLocaleDateString('de-DE', options)
  
  if (start === end) {
    return start
  }
  
  return `${start} - ${end}`
}

/**
 * Get pricing calendar for a month
 */
export async function getPricingCalendar(
  apartmentId: string,
  year: number,
  month: number,
  basePrice: number
): Promise<Map<string, PriceCalculation>> {
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0)
  
  // Format dates as strings for SQLite - use local dates
  const startYear = startDate.getFullYear()
  const startMonth = String(startDate.getMonth() + 1).padStart(2, '0')
  const startDay = String(startDate.getDate()).padStart(2, '0')
  const startDateStr = `${startYear}-${startMonth}-${startDay}`
  
  const endYear = endDate.getFullYear()
  const endMonth = String(endDate.getMonth() + 1).padStart(2, '0')
  const endDay = String(endDate.getDate()).padStart(2, '0')
  const endDateStr = `${endYear}-${endMonth}-${endDay}`
  
  const calendar = new Map<string, PriceCalculation>()

  // Fetch all pricing data for the month
  const [seasonPrices, eventPrices, discountRules] = await Promise.all([
    prisma.seasonPrice.findMany({
      where: {
        apartmentId,
        isActive: true,
        OR: [
          {
            startDate: { lte: endDateStr },
            endDate: { gte: startDateStr }
          }
        ]
      },
      orderBy: { priority: 'desc' }
    }),
    prisma.eventPrice.findMany({
      where: {
        apartmentId,
        isActive: true,
        OR: [
          {
            startDate: { lte: endDateStr },
            endDate: { gt: startDateStr }  // Exclusive end date
          }
        ]
      }
    }),
    prisma.discountRule.findMany({
      where: {
        apartmentId,
        isActive: true
      },
      orderBy: { minNights: 'asc' }
    })
  ])

  // Calculate price for each day
  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    // Format current date as local date string
    const currentYear = currentDate.getFullYear()
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0')
    const currentDay = String(currentDate.getDate()).padStart(2, '0')
    const dateKey = `${currentYear}-${currentMonth}-${currentDay}`
    
    // Check for event price (highest priority)
    // End date is exclusive
    const eventPrice = eventPrices.find(ep => {
      return dateKey >= ep.startDate && dateKey < ep.endDate
    })

    if (eventPrice) {
      calendar.set(dateKey, {
        date: new Date(currentDate),
        basePrice,
        appliedPrice: eventPrice.price,
        priceType: 'SPECIAL_EVENT',
        discountPercentage: 0,
        finalPrice: eventPrice.price,
        source: eventPrice.eventName
      })
    } else {
      // Check for season price
      // End date is exclusive
      const seasonPrice = seasonPrices.find(sp => {
        // Compare as strings for SQLite compatibility
        return dateKey >= sp.startDate && dateKey < sp.endDate
      })

      if (seasonPrice) {
        calendar.set(dateKey, {
          date: new Date(currentDate),
          basePrice,
          appliedPrice: seasonPrice.price,
          priceType: seasonPrice.type as any,
          discountPercentage: 0,
          finalPrice: seasonPrice.price,
          source: seasonPrice.name
        })
      } else {
        // Use base price
        calendar.set(dateKey, {
          date: new Date(currentDate),
          basePrice,
          appliedPrice: basePrice,
          priceType: 'OFFICIAL',
          discountPercentage: 0,
          finalPrice: basePrice,
          source: 'Base Price'
        })
      }
    }

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return calendar
}