import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params

    // Check if apartment exists
    const apartment = await prisma.apartment.findUnique({
      where: { id },
      include: {
        bookings: true
      }
    })

    if (!apartment) {
      return NextResponse.json(
        { error: 'Apartment not found' },
        { status: 404 }
      )
    }

    // Check if there are active bookings
    const activeBookings = apartment.bookings.filter(
      booking => booking.status === 'CONFIRMED' && new Date(booking.checkOut) > new Date()
    )

    if (activeBookings.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete apartment with active bookings' },
        { status: 400 }
      )
    }

    // Delete related records first
    await prisma.$transaction([
      // Delete room images
      prisma.roomImage.deleteMany({
        where: { apartmentId: id }
      }),
      // Delete room categories
      prisma.roomCategory.deleteMany({
        where: { apartmentId: id }
      }),
      // Delete pricing rules
      prisma.discountRule.deleteMany({
        where: { apartmentId: id }
      }),
      prisma.seasonPrice.deleteMany({
        where: { apartmentId: id }
      }),
      prisma.eventPrice.deleteMany({
        where: { apartmentId: id }
      }),
      // Delete bookings
      prisma.booking.deleteMany({
        where: { apartmentId: id }
      }),
      // Delete reviews
      prisma.review.deleteMany({
        where: { apartmentId: id }
      }),
      // Finally delete the apartment
      prisma.apartment.delete({
        where: { id }
      })
    ])

    return NextResponse.json({
      success: true,
      message: 'Apartment deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting apartment:', error)
    return NextResponse.json(
      { error: 'Failed to delete apartment' },
      { status: 500 }
    )
  }
}