import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const apartmentId = id

    // Fetch all confirmed bookings for this apartment
    const bookings = await prisma.booking.findMany({
      where: {
        apartmentId,
        status: {
          in: ['CONFIRMED', 'PENDING']
        },
        checkOut: {
          gte: new Date() // Only future bookings
        }
      },
      select: {
        checkIn: true,
        checkOut: true
      }
    })

    // Convert bookings to date ranges
    const bookedDates = bookings.map(booking => ({
      from: booking.checkIn.toISOString(),
      to: booking.checkOut.toISOString()
    }))

    return NextResponse.json({ bookedDates })
  } catch (error) {
    console.error('Error fetching booked dates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booked dates' },
      { status: 500 }
    )
  }
}