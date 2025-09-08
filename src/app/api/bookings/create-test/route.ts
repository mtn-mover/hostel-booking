import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()

    const {
      apartmentId,
      checkIn,
      checkOut,
      guests,
      totalPrice,
      guestInfo
    } = body

    // Check for overlapping bookings
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)

    const existingBookings = await prisma.booking.findMany({
      where: {
        apartmentId,
        status: {
          in: ['CONFIRMED', 'PENDING']
        },
        OR: [
          {
            // New booking starts during existing booking
            checkIn: {
              lte: checkInDate
            },
            checkOut: {
              gt: checkInDate
            }
          },
          {
            // New booking ends during existing booking
            checkIn: {
              lt: checkOutDate
            },
            checkOut: {
              gte: checkOutDate
            }
          },
          {
            // New booking completely overlaps existing booking
            checkIn: {
              gte: checkInDate
            },
            checkOut: {
              lte: checkOutDate
            }
          }
        ]
      }
    })

    if (existingBookings.length > 0) {
      return NextResponse.json(
        { error: 'Diese Daten sind bereits gebucht. Bitte wählen Sie andere Daten.' },
        { status: 409 }
      )
    }

    // Create a test user if not logged in
    let userId = session?.user?.id
    
    if (!userId) {
      // Find or create a test user
      let testUser = await prisma.user.findUnique({
        where: { email: guestInfo.email }
      })

      if (!testUser) {
        testUser = await prisma.user.create({
          data: {
            email: guestInfo.email,
            name: guestInfo.name,
            role: 'GUEST'
          }
        })
      }
      
      userId = testUser.id
    }

    // Create the booking with TEST payment status
    const booking = await prisma.booking.create({
      data: {
        userId,
        apartmentId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests,
        totalPrice,
        status: 'CONFIRMED',
        paymentStatus: 'PAID', // Mark as paid for testing
        paymentIntentId: `test_${Date.now()}`, // Generate a test payment ID
        guestName: guestInfo.name,
        guestEmail: guestInfo.email,
        guestPhone: guestInfo.phone || '',
        specialRequests: guestInfo.specialRequests || ''
      }
    })

    return NextResponse.json({
      bookingId: booking.id,
      status: 'success',
      message: 'Test booking created successfully'
    })
  } catch (error) {
    console.error('Test booking error:', error)
    return NextResponse.json(
      { error: 'Failed to create test booking' },
      { status: 500 }
    )
  }
}