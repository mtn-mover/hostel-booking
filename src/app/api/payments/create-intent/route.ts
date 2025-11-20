import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not defined')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia'
  })
}

export async function POST(request: NextRequest) {
  try {
    const { 
      apartmentId, 
      checkIn, 
      checkOut, 
      guests, 
      totalPrice,
      guestInfo 
    } = await request.json()

    // Validate required fields
    if (!apartmentId || !checkIn || !checkOut || !guests || !totalPrice || !guestInfo) {
      return NextResponse.json(
        { error: 'Missing required booking information' },
        { status: 400 }
      )
    }

    // Check if apartment exists and is available
    const apartment = await prisma.apartment.findUnique({
      where: { id: apartmentId, isActive: true }
    })

    if (!apartment) {
      return NextResponse.json(
        { error: 'Apartment not found or not available' },
        { status: 404 }
      )
    }

    // Check for existing bookings in the date range
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
            checkIn: {
              lt: checkOutDate
            },
            checkOut: {
              gt: checkInDate
            }
          }
        ]
      }
    })

    if (existingBookings.length > 0) {
      return NextResponse.json(
        { error: 'Selected dates are no longer available' },
        { status: 409 }
      )
    }

    // Create a temporary booking record
    const tempBooking = await prisma.booking.create({
      data: {
        userId: 'temp-user', // We'll update this when we implement auth
        apartmentId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests,
        totalPrice,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        guestName: guestInfo.name,
        guestEmail: guestInfo.email,
        guestPhone: guestInfo.phone || null,
        specialRequests: guestInfo.specialRequests || null
      }
    })

    // Create Stripe Payment Intent
    const stripe = getStripe()
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100), // Stripe expects cents
      currency: 'chf',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        bookingId: tempBooking.id,
        apartmentId,
        guestEmail: guestInfo.email,
        checkIn: checkIn,
        checkOut: checkOut,
        guests: guests.toString()
      }
    })

    // Update booking with payment intent ID
    await prisma.booking.update({
      where: { id: tempBooking.id },
      data: { paymentIntentId: paymentIntent.id }
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      bookingId: tempBooking.id,
      paymentIntentId: paymentIntent.id
    })

  } catch (error) {
    console.error('Payment intent creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}