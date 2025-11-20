import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: apartmentId } = await params

    // Fetch all pricing data
    const [seasonPrices, eventPrices, discountRules] = await Promise.all([
      prisma.seasonPrice.findMany({
        where: { apartmentId },
        orderBy: { startDate: 'asc' }
      }),
      prisma.eventPrice.findMany({
        where: { apartmentId },
        orderBy: { startDate: 'asc' }
      }),
      prisma.discountRule.findMany({
        where: { apartmentId },
        orderBy: { minNights: 'asc' }
      })
    ])

    return NextResponse.json({
      seasonPrices,
      eventPrices,
      discountRules
    })
  } catch (error) {
    console.error('GET pricing error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pricing data' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: apartmentId } = await params
    const body = await request.json()
    
    // Check if this is a partial update (only one type of pricing data)
    const hasSeasons = body.seasonPrices !== undefined
    const hasEvents = body.eventPrices !== undefined
    const hasDiscounts = body.discountRules !== undefined
    
    // If only one type is present, do partial update
    if ((hasSeasons && !hasEvents && !hasDiscounts) ||
        (!hasSeasons && hasEvents && !hasDiscounts) ||
        (!hasSeasons && !hasEvents && hasDiscounts)) {
      
      await prisma.$transaction(async (tx) => {
        // Update only seasons
        if (hasSeasons) {
          await tx.seasonPrice.deleteMany({ where: { apartmentId } })
          if (body.seasonPrices && body.seasonPrices.length > 0) {
            await tx.seasonPrice.createMany({
              data: body.seasonPrices.map((season: any) => ({
                apartmentId,
                name: season.name,
                type: season.type,
                price: season.price,
                startDate: season.startDate, // Already a string in YYYY-MM-DD format
                endDate: season.endDate,     // Already a string in YYYY-MM-DD format
                priority: season.type === 'HIGH_SEASON' ? 2 : season.type === 'MID_SEASON' ? 1 : 0,
                isActive: season.isActive
              }))
            })
          }
        }
        
        // Update only events
        if (hasEvents) {
          await tx.eventPrice.deleteMany({ where: { apartmentId } })
          if (body.eventPrices && body.eventPrices.length > 0) {
            await tx.eventPrice.createMany({
              data: body.eventPrices.map((event: any) => ({
                apartmentId,
                eventName: event.eventName,
                startDate: event.startDate, // Already a string in YYYY-MM-DD format
                endDate: event.endDate,     // Already a string in YYYY-MM-DD format
                price: event.price,
                isActive: event.isActive
              }))
            })
          }
        }
        
        // Update only discounts
        if (hasDiscounts) {
          await tx.discountRule.deleteMany({ where: { apartmentId } })
          if (body.discountRules && body.discountRules.length > 0) {
            await tx.discountRule.createMany({
              data: body.discountRules.map((discount: any) => ({
                apartmentId,
                minNights: discount.minNights,
                percentage: discount.percentage,
                isActive: discount.isActive
              }))
            })
          }
        }
      })
      
      return NextResponse.json({ success: true })
    }
    
    // Full update - update all types (backward compatibility)
    const { seasonPrices, eventPrices, discountRules } = body

    await prisma.$transaction(async (tx) => {
      // Delete existing data
      await tx.seasonPrice.deleteMany({ where: { apartmentId } })
      await tx.eventPrice.deleteMany({ where: { apartmentId } })
      await tx.discountRule.deleteMany({ where: { apartmentId } })

      // Insert new season prices
      if (seasonPrices && seasonPrices.length > 0) {
        await tx.seasonPrice.createMany({
          data: seasonPrices.map((season: any) => ({
            apartmentId,
            name: season.name,
            type: season.type,
            price: season.price,
            startDate: season.startDate, // Already a string in YYYY-MM-DD format
            endDate: season.endDate,     // Already a string in YYYY-MM-DD format
            priority: season.type === 'HIGH_SEASON' ? 2 : season.type === 'MID_SEASON' ? 1 : 0,
            isActive: season.isActive
          }))
        })
      }

      // Insert new event prices
      if (eventPrices && eventPrices.length > 0) {
        await tx.eventPrice.createMany({
          data: eventPrices.map((event: any) => ({
            apartmentId,
            eventName: event.eventName,
            startDate: event.startDate, // Already a string in YYYY-MM-DD format
            endDate: event.endDate,     // Already a string in YYYY-MM-DD format
            price: event.price,
            isActive: event.isActive
          }))
        })
      }

      // Insert new discount rules
      if (discountRules && discountRules.length > 0) {
        await tx.discountRule.createMany({
          data: discountRules.map((discount: any) => ({
            apartmentId,
            minNights: discount.minNights,
            percentage: discount.percentage,
            isActive: discount.isActive
          }))
        })
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('POST pricing error:', error)
    return NextResponse.json(
      { error: 'Failed to save pricing data' },
      { status: 500 }
    )
  }
}