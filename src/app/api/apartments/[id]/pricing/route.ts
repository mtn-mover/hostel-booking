import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPriceForDate, getPricingCalendar } from '@/lib/pricing'
import { addDays, startOfDay } from 'date-fns'

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
    const startDateParam = searchParams.get('startDate')
    const endDateParam = searchParams.get('endDate')
    
    if (!startDateParam || !endDateParam) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      )
    }

    const startDate = new Date(startDateParam)
    const endDate = new Date(endDateParam)

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

    // Get available discount rules
    const discountRules = await prisma.discountRule.findMany({
      where: {
        apartmentId: id,
        isActive: true
      },
      orderBy: { minNights: 'asc' }
    })

    // Generate daily pricing
    const dailyPricing: any[] = []
    let currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      const price = await getPriceForDate(id, currentDate, apartment.price)
      
      // Check if date is available
      const availability = await prisma.availability.findUnique({
        where: {
          apartmentId_date: {
            apartmentId: id,
            date: startOfDay(currentDate)
          }
        }
      })
      
      dailyPricing.push({
        date: currentDate.toISOString().split('T')[0],
        price,
        available: !availability || availability.status === 'AVAILABLE',
        status: availability?.status || 'AVAILABLE'
      })
      
      currentDate = addDays(currentDate, 1)
    }

    // Get season and event prices for display
    // Format dates as strings for SQLite
    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]
    
    const [seasonPrices, eventPrices] = await Promise.all([
      prisma.seasonPrice.findMany({
        where: {
          apartmentId: id,
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
          apartmentId: id,
          isActive: true,
          date: {
            gte: startDateStr,
            lte: endDateStr
          }
        }
      })
    ])

    // Format discount tiers
    const discountTiers = discountRules.map(rule => ({
      minNights: rule.minNights,
      percentage: rule.percentage,
      description: `${rule.minNights}+ nights: ${rule.percentage}% off`
    }))

    return NextResponse.json({
      apartmentId: id,
      basePrice: apartment.price,
      dailyPricing,
      discountTiers,
      activeSeason: seasonPrices[0] || null,
      upcomingEvents: eventPrices,
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Pricing calculation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}