import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { sendBookingConfirmationEmail, sendBookingCancellationEmail } from '@/lib/email'

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not defined')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia'
  })
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  const stripe = getStripe()
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!endpointSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentSuccess(paymentIntent)
        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent
        await handlePaymentFailed(failedPayment)
        break

      case 'payment_intent.canceled':
        const canceledPayment = event.data.object as Stripe.PaymentIntent
        await handlePaymentCanceled(canceledPayment)
        break

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const bookingId = paymentIntent.metadata.bookingId

  if (!bookingId) {
    console.error('No booking ID found in payment intent metadata')
    return
  }

  // Update booking status
  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'CONFIRMED',
      paymentStatus: 'PAID'
    },
    include: {
      apartment: true
    }
  })

  // Block availability for the booked dates
  const checkInDate = new Date(booking.checkIn)
  const checkOutDate = new Date(booking.checkOut)
  
  const availabilityPromises = []
  const currentDate = new Date(checkInDate)
  
  while (currentDate < checkOutDate) {
    availabilityPromises.push(
      prisma.availability.upsert({
        where: {
          apartmentId_date: {
            apartmentId: booking.apartmentId,
            date: new Date(currentDate)
          }
        },
        update: {
          status: 'BOOKED'
        },
        create: {
          apartmentId: booking.apartmentId,
          date: new Date(currentDate),
          status: 'BOOKED'
        }
      })
    )
    currentDate.setDate(currentDate.getDate() + 1)
  }

  await Promise.all(availabilityPromises)

  console.log(`Booking ${bookingId} confirmed and availability updated`)

  // Send confirmation email to guest
  try {
    await sendBookingConfirmationEmail(booking)
    console.log(`Confirmation email sent for booking ${bookingId}`)
  } catch (error) {
    console.error('Failed to send confirmation email:', error)
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const bookingId = paymentIntent.metadata.bookingId

  if (!bookingId) {
    console.error('No booking ID found in payment intent metadata')
    return
  }

  // Update booking status
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      paymentStatus: 'FAILED'
    }
  })

  console.log(`Payment failed for booking ${bookingId}`)
}

async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  const bookingId = paymentIntent.metadata.bookingId

  if (!bookingId) {
    console.error('No booking ID found in payment intent metadata')
    return
  }

  // Update booking status
  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'CANCELLED',
      paymentStatus: 'FAILED',
      cancelledAt: new Date(),
      cancellationReason: 'Payment canceled'
    },
    include: {
      apartment: true
    }
  })

  console.log(`Payment canceled for booking ${bookingId}`)

  // Send cancellation email to guest
  try {
    await sendBookingCancellationEmail(booking)
    console.log(`Cancellation email sent for booking ${bookingId}`)
  } catch (error) {
    console.error('Failed to send cancellation email:', error)
  }
}