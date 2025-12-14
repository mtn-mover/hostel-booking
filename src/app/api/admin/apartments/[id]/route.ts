import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

interface Props {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const apartment = await prisma.apartment.findUnique({
      where: { id },
      include: {
        apartmentImages: true,
        apartmentAmenities: {
          include: {
            amenity: true
          }
        }
      }
    })

    if (!apartment) {
      return NextResponse.json(
        { error: 'Apartment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(apartment)
  } catch (error) {
    console.error('Get apartment error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch apartment' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Nicht autorisiert. Bitte melden Sie sich als Admin an.' },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { amenityIds, ...apartmentData } = data

    // Build update data object, only including defined values
    const updateData: any = {}

    if (apartmentData.title !== undefined) updateData.title = apartmentData.title
    if (apartmentData.description !== undefined) updateData.description = apartmentData.description
    if (apartmentData.shortDescription !== undefined) updateData.shortDescription = apartmentData.shortDescription || null
    if (apartmentData.theSpace !== undefined) updateData.theSpace = apartmentData.theSpace || null
    if (apartmentData.guestAccess !== undefined) updateData.guestAccess = apartmentData.guestAccess || null
    if (apartmentData.otherNotes !== undefined) updateData.otherNotes = apartmentData.otherNotes || null
    if (apartmentData.maxGuests !== undefined) updateData.maxGuests = apartmentData.maxGuests
    if (apartmentData.bedrooms !== undefined) updateData.bedrooms = apartmentData.bedrooms
    if (apartmentData.beds !== undefined) updateData.beds = apartmentData.beds
    if (apartmentData.bathrooms !== undefined) updateData.bathrooms = apartmentData.bathrooms
    if (apartmentData.size !== undefined) updateData.size = apartmentData.size || null
    if (apartmentData.price !== undefined) updateData.price = apartmentData.price ?? 0
    if (apartmentData.cleaningFee !== undefined) updateData.cleaningFee = apartmentData.cleaningFee ?? 0
    if (apartmentData.minStayNights !== undefined) updateData.minStayNights = apartmentData.minStayNights ?? 1
    if (apartmentData.maxStayNights !== undefined) updateData.maxStayNights = apartmentData.maxStayNights || null
    if (apartmentData.address !== undefined) updateData.address = apartmentData.address || null
    if (apartmentData.postalCode !== undefined) updateData.postalCode = apartmentData.postalCode || null
    if (apartmentData.city !== undefined) updateData.city = apartmentData.city
    if (apartmentData.country !== undefined) updateData.country = apartmentData.country
    if (apartmentData.latitude !== undefined) updateData.latitude = apartmentData.latitude || null
    if (apartmentData.longitude !== undefined) updateData.longitude = apartmentData.longitude || null
    if (apartmentData.isActive !== undefined) updateData.isActive = apartmentData.isActive
    if (apartmentData.airbnbId !== undefined) updateData.airbnbId = apartmentData.airbnbId || null
    if (apartmentData.airbnbUrl !== undefined) updateData.airbnbUrl = apartmentData.airbnbUrl || null
    if (apartmentData.bookingHorizon !== undefined) updateData.bookingHorizon = apartmentData.bookingHorizon || null

    // Update apartment basic data
    const updatedApartment = await prisma.apartment.update({
      where: { id },
      data: updateData
    })

    // Update amenities if provided
    if (amenityIds !== undefined) {
      // Delete existing amenity relationships
      await prisma.apartmentAmenity.deleteMany({
        where: { apartmentId: id }
      })

      // Create new amenity relationships
      if (amenityIds.length > 0) {
        await prisma.apartmentAmenity.createMany({
          data: amenityIds.map((amenityId: string) => ({
            apartmentId: id,
            amenityId
          }))
        })
      }
    }

    return NextResponse.json(updatedApartment)
  } catch (error) {
    console.error('Update apartment error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to update apartment', message: `Fehler beim Aktualisieren: ${errorMessage}` },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if apartment has active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        apartmentId: id,
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      }
    })

    if (activeBookings > 0) {
      return NextResponse.json(
        { error: 'Cannot delete apartment with active bookings' },
        { status: 400 }
      )
    }

    // Delete apartment (cascading will handle related records)
    await prisma.apartment.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete apartment error:', error)
    return NextResponse.json(
      { error: 'Failed to delete apartment' },
      { status: 500 }
    )
  }
}