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
    // Parse numeric values to ensure correct types for PostgreSQL
    // Integer fields: maxGuests, bedrooms, beds, size, minStayNights, maxStayNights
    // Float fields: price, cleaningFee, bathrooms, latitude, longitude
    const updateData: Record<string, unknown> = {}

    // String fields
    if (apartmentData.title !== undefined) updateData.title = String(apartmentData.title)
    if (apartmentData.description !== undefined) updateData.description = String(apartmentData.description)
    if (apartmentData.shortDescription !== undefined) updateData.shortDescription = apartmentData.shortDescription ? String(apartmentData.shortDescription) : null
    if (apartmentData.theSpace !== undefined) updateData.theSpace = apartmentData.theSpace ? String(apartmentData.theSpace) : null
    if (apartmentData.guestAccess !== undefined) updateData.guestAccess = apartmentData.guestAccess ? String(apartmentData.guestAccess) : null
    if (apartmentData.otherNotes !== undefined) updateData.otherNotes = apartmentData.otherNotes ? String(apartmentData.otherNotes) : null
    if (apartmentData.address !== undefined) updateData.address = apartmentData.address ? String(apartmentData.address) : null
    if (apartmentData.city !== undefined) updateData.city = String(apartmentData.city)
    if (apartmentData.country !== undefined) updateData.country = String(apartmentData.country)
    if (apartmentData.airbnbId !== undefined) updateData.airbnbId = apartmentData.airbnbId ? String(apartmentData.airbnbId) : null
    if (apartmentData.airbnbUrl !== undefined) updateData.airbnbUrl = apartmentData.airbnbUrl ? String(apartmentData.airbnbUrl) : null
    if (apartmentData.bookingHorizon !== undefined) updateData.bookingHorizon = apartmentData.bookingHorizon ? String(apartmentData.bookingHorizon) : null

    // Integer fields
    if (apartmentData.maxGuests !== undefined) {
      const val = parseInt(String(apartmentData.maxGuests), 10)
      updateData.maxGuests = isNaN(val) ? 2 : val
    }
    if (apartmentData.bedrooms !== undefined) {
      const val = parseInt(String(apartmentData.bedrooms), 10)
      updateData.bedrooms = isNaN(val) ? 1 : val
    }
    if (apartmentData.beds !== undefined) {
      const val = parseInt(String(apartmentData.beds), 10)
      updateData.beds = isNaN(val) ? 1 : val
    }
    if (apartmentData.size !== undefined) {
      if (apartmentData.size !== null && apartmentData.size !== '') {
        const val = parseInt(String(apartmentData.size), 10)
        updateData.size = isNaN(val) ? null : val
      } else {
        updateData.size = null
      }
    }
    if (apartmentData.minStayNights !== undefined) {
      const val = parseInt(String(apartmentData.minStayNights), 10)
      updateData.minStayNights = isNaN(val) ? 1 : val
    }
    if (apartmentData.maxStayNights !== undefined) {
      if (apartmentData.maxStayNights !== null && apartmentData.maxStayNights !== '') {
        const val = parseInt(String(apartmentData.maxStayNights), 10)
        updateData.maxStayNights = isNaN(val) ? null : val
      } else {
        updateData.maxStayNights = null
      }
    }

    // Float fields
    if (apartmentData.price !== undefined) {
      const val = parseFloat(String(apartmentData.price))
      updateData.price = isNaN(val) ? 0 : val
    }
    if (apartmentData.cleaningFee !== undefined) {
      const val = parseFloat(String(apartmentData.cleaningFee))
      updateData.cleaningFee = isNaN(val) ? 0 : val
    }
    if (apartmentData.bathrooms !== undefined) {
      const val = parseFloat(String(apartmentData.bathrooms))
      updateData.bathrooms = isNaN(val) ? 1 : val
    }
    if (apartmentData.latitude !== undefined) {
      if (apartmentData.latitude !== null && apartmentData.latitude !== '') {
        const val = parseFloat(String(apartmentData.latitude))
        updateData.latitude = isNaN(val) ? null : val
      } else {
        updateData.latitude = null
      }
    }
    if (apartmentData.longitude !== undefined) {
      if (apartmentData.longitude !== null && apartmentData.longitude !== '') {
        const val = parseFloat(String(apartmentData.longitude))
        updateData.longitude = isNaN(val) ? null : val
      } else {
        updateData.longitude = null
      }
    }

    // Boolean fields
    if (apartmentData.isActive !== undefined) updateData.isActive = Boolean(apartmentData.isActive)

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