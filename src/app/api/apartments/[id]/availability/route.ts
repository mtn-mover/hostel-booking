import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    
    // Get query parameters
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      )
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (start >= end) {
      return NextResponse.json(
        { error: 'startDate must be before endDate' },
        { status: 400 }
      )
    }

    // Check if apartment exists
    const apartment = await prisma.apartment.findUnique({
      where: { id, isActive: true }
    })

    if (!apartment) {
      return NextResponse.json(
        { error: 'Apartment not found' },
        { status: 404 }
      )
    }

    // Get availability for the date range
    const availabilities = await prisma.availability.findMany({
      where: {
        apartmentId: id,
        date: {
          gte: start,
          lte: end
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    // Get active pricing rules for this apartment
    const pricingRules = await prisma.pricingRule.findMany({
      where: {
        apartmentId: id,
        isActive: true
      },
      orderBy: {
        priority: 'desc'
      }
    })

    // Get existing bookings for the date range
    const bookings = await prisma.booking.findMany({
      where: {
        apartmentId: id,
        status: {
          in: ['CONFIRMED', 'PENDING']
        },
        OR: [
          {
            checkIn: {
              lte: end
            },
            checkOut: {
              gt: start
            }
          }
        ]
      },
      select: {
        checkIn: true,
        checkOut: true,
        status: true
      }
    })

    // Create a map of all dates in the range with their availability status
    const dateMap = new Map<string, {
      date: string
      isAvailable: boolean
      status: string
      price: number
      reason?: string
    }>()

    // Helper function to apply pricing rules to a date
    const calculatePriceForDate = (date: Date, basePrice: number): number => {
      let price = basePrice
      
      // Apply pricing rules in priority order
      for (const rule of pricingRules) {
        // Check if date falls within rule's date range
        if (rule.startDate && rule.endDate) {
          if (date >= rule.startDate && date <= rule.endDate) {
            price = basePrice * rule.priceModifier
            break // Use highest priority matching rule
          }
        }
        
        // Check day of week rules
        if (rule.dayOfWeek !== null && date.getDay() === rule.dayOfWeek) {
          price = basePrice * rule.priceModifier
          break
        }
      }
      
      return Math.round(price)
    }

    // Fill in all dates in the range with default availability
    const currentDate = new Date(start)
    while (currentDate <= end) {
      const dateString = currentDate.toISOString().split('T')[0]
      const calculatedPrice = calculatePriceForDate(currentDate, apartment.price)
      
      dateMap.set(dateString, {
        date: dateString,
        isAvailable: true,
        status: 'AVAILABLE',
        price: calculatedPrice
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Update with explicit availability records
    availabilities.forEach(availability => {
      const dateString = availability.date.toISOString().split('T')[0]
      if (dateMap.has(dateString)) {
        const basePrice = availability.priceOverride || apartment.price
        const finalPrice = availability.priceOverride 
          ? basePrice 
          : calculatePriceForDate(availability.date, apartment.price)
        
        dateMap.set(dateString, {
          date: dateString,
          isAvailable: availability.status === 'AVAILABLE',
          status: availability.status,
          price: finalPrice,
          reason: availability.reason || undefined
        })
      }
    })

    // Mark dates as unavailable if there are bookings
    bookings.forEach(booking => {
      const bookingStart = new Date(booking.checkIn)
      const bookingEnd = new Date(booking.checkOut)
      
      const current = new Date(bookingStart)
      while (current < bookingEnd) {
        const dateString = current.toISOString().split('T')[0]
        if (dateMap.has(dateString)) {
          dateMap.set(dateString, {
            date: dateString,
            isAvailable: false,
            status: 'BOOKED',
            price: apartment.price,
            reason: 'Already booked'
          })
        }
        current.setDate(current.getDate() + 1)
      }
    })

    const availabilityData = Array.from(dateMap.values()).sort((a, b) => 
      a.date.localeCompare(b.date)
    )

    return NextResponse.json({
      apartmentId: id,
      startDate: startDate,
      endDate: endDate,
      availability: availabilityData
    })

  } catch (error) {
    console.error('Availability check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}