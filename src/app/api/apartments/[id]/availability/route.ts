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

    // Get active seasonal and event prices for this apartment
    const [seasonPrices, eventPrices] = await Promise.all([
      prisma.seasonPrice.findMany({
        where: {
          apartmentId: id,
          isActive: true
        },
        orderBy: {
          priority: 'desc'
        }
      }),
      prisma.eventPrice.findMany({
        where: {
          apartmentId: id,
          isActive: true
        }
      })
    ])

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

    // Helper function to get price for a specific date
    const calculatePriceForDate = (date: Date, basePrice: number): number => {
      const dateString = date.toISOString().split('T')[0]
      
      // First check for event prices (highest priority)
      // End date is exclusive (like check-out date)
      for (const event of eventPrices) {
        if (dateString >= event.startDate && dateString < event.endDate) {
          return Math.round(event.price)
        }
      }
      
      // Then check for seasonal prices
      // End date is exclusive (like check-out date)
      for (const season of seasonPrices) {
        if (dateString >= season.startDate && dateString < season.endDate) {
          return Math.round(season.price)
        }
      }
      
      // Default to base price
      return Math.round(basePrice)
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