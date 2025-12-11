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
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { amenityIds, ...apartmentData } = data

    // Update apartment basic data
    const updatedApartment = await prisma.apartment.update({
      where: { id },
      data: {
        title: apartmentData.title,
        description: apartmentData.description,
        shortDescription: apartmentData.shortDescription || null,
        theSpace: apartmentData.theSpace || null,
        guestAccess: apartmentData.guestAccess || null,
        otherNotes: apartmentData.otherNotes || null,
        maxGuests: apartmentData.maxGuests,
        bedrooms: apartmentData.bedrooms,
        beds: apartmentData.beds,
        bathrooms: apartmentData.bathrooms,
        size: apartmentData.size || null,
        price: apartmentData.price ?? 0,
        cleaningFee: apartmentData.cleaningFee ?? 0,
        minStayNights: apartmentData.minStayNights ?? 1,
        maxStayNights: apartmentData.maxStayNights || null,
        address: apartmentData.address || null,
        postalCode: apartmentData.postalCode || null,
        city: apartmentData.city,
        country: apartmentData.country,
        latitude: apartmentData.latitude || null,
        longitude: apartmentData.longitude || null,
        isActive: apartmentData.isActive,
        airbnbId: apartmentData.airbnbId || null,
        airbnbUrl: apartmentData.airbnbUrl || null,
        bookingHorizon: apartmentData.bookingHorizon || null,
      }
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
    return NextResponse.json(
      { error: 'Failed to update apartment' },
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