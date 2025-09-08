import { NextRequest, NextResponse } from 'next/server'
import { calculateTotalPrice } from '@/lib/pricing'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { checkIn, checkOut } = body

    if (!checkIn || !checkOut) {
      return NextResponse.json(
        { error: 'checkIn and checkOut dates are required' },
        { status: 400 }
      )
    }

    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)

    if (checkInDate >= checkOutDate) {
      return NextResponse.json(
        { error: 'checkIn must be before checkOut' },
        { status: 400 }
      )
    }

    // Get apartment
    const apartment = await prisma.apartment.findUnique({
      where: { id, isActive: true }
    })

    if (!apartment) {
      return NextResponse.json(
        { error: 'Apartment not found' },
        { status: 404 }
      )
    }

    // Calculate total price with season prices and discounts
    const priceDetails = await calculateTotalPrice(
      id,
      checkInDate,
      checkOutDate,
      apartment.price
    )

    return NextResponse.json(priceDetails)

  } catch (error) {
    console.error('Price calculation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}