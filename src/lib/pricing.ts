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
  const eventPrice = await prisma.eventPrice.findFirst({
    where: {
      apartmentId,
      date: dateStr,
      isActive: true
    }
  })

  if (eventPrice) {
    return eventPrice.price
  }

  // Check for season prices
  const seasonPrice = await prisma.seasonPrice.findFirst({
    where: {
      apartmentId,
      startDate: { lte: dateStr },
      endDate: { gte: dateStr },
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

  // Get price for each night
  const pricePerNight: number[] = []
  let subtotal = 0

  const currentDate = new Date(checkIn)
  while (currentDate < checkOut) {
    const dayPrice = await getPriceForDate(apartmentId, currentDate, basePrice)
    pricePerNight.push(dayPrice)
    subtotal += dayPrice
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
      minNights: 'desc' // Get the highest applicable discount
    }
  })

  const discountPercentage = discountRule?.percentage || 0
  const discountAmount = (subtotal * discountPercentage) / 100

  // Get apartment for fees
  const apartment = await prisma.apartment.findUnique({
    where: { id: apartmentId },
    select: { cleaningFee: true }
  })

  const cleaningFee = apartment?.cleaningFee || 50
  const serviceFee = (subtotal - discountAmount) * 0.15 // 15% service fee

  const total = subtotal - discountAmount + cleaningFee + serviceFee

  return {
    nights,
    pricePerNight,
    subtotal,
    discountPercentage,
    discountAmount,
    cleaningFee,
    serviceFee,
    total
  }
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
        date: {
          gte: startDateStr,
          lte: endDateStr
        }
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
    const eventPrice = eventPrices.find(ep => {
      // Compare date strings directly
      return ep.date === dateKey
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
      const seasonPrice = seasonPrices.find(sp => {
        // Compare as strings for SQLite compatibility
        return dateKey >= sp.startDate && dateKey <= sp.endDate
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