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

    // Get current apartment data to merge with updates
    const currentApartment = await prisma.apartment.findUnique({
      where: { id }
    })

    if (!currentApartment) {
      return NextResponse.json(
        { error: 'Apartment not found' },
        { status: 404 }
      )
    }

    // Parse and prepare all fields with proper types
    // String fields
    const title = apartmentData.title !== undefined ? String(apartmentData.title) : currentApartment.title
    const description = apartmentData.description !== undefined ? String(apartmentData.description) : currentApartment.description
    const shortDescription = apartmentData.shortDescription !== undefined
      ? (apartmentData.shortDescription ? String(apartmentData.shortDescription) : null)
      : currentApartment.shortDescription
    const theSpace = apartmentData.theSpace !== undefined
      ? (apartmentData.theSpace ? String(apartmentData.theSpace) : null)
      : currentApartment.theSpace
    const guestAccess = apartmentData.guestAccess !== undefined
      ? (apartmentData.guestAccess ? String(apartmentData.guestAccess) : null)
      : currentApartment.guestAccess
    const otherNotes = apartmentData.otherNotes !== undefined
      ? (apartmentData.otherNotes ? String(apartmentData.otherNotes) : null)
      : currentApartment.otherNotes
    const address = apartmentData.address !== undefined
      ? (apartmentData.address ? String(apartmentData.address) : null)
      : currentApartment.address
    const city = apartmentData.city !== undefined ? String(apartmentData.city) : currentApartment.city
    const country = apartmentData.country !== undefined ? String(apartmentData.country) : currentApartment.country
    const airbnbId = apartmentData.airbnbId !== undefined
      ? (apartmentData.airbnbId ? String(apartmentData.airbnbId) : null)
      : currentApartment.airbnbId
    const airbnbUrl = apartmentData.airbnbUrl !== undefined
      ? (apartmentData.airbnbUrl ? String(apartmentData.airbnbUrl) : null)
      : currentApartment.airbnbUrl
    const bookingHorizon = apartmentData.bookingHorizon !== undefined
      ? (apartmentData.bookingHorizon ? String(apartmentData.bookingHorizon) : null)
      : currentApartment.bookingHorizon
    const selectedRoomIds = apartmentData.selectedRoomIds !== undefined
      ? JSON.stringify(apartmentData.selectedRoomIds)
      : currentApartment.selectedRoomIds

    // Integer fields
    let maxGuests = currentApartment.maxGuests
    if (apartmentData.maxGuests !== undefined) {
      const val = parseInt(String(apartmentData.maxGuests), 10)
      maxGuests = isNaN(val) ? 2 : val
    }

    let bedrooms = currentApartment.bedrooms
    if (apartmentData.bedrooms !== undefined) {
      const val = parseInt(String(apartmentData.bedrooms), 10)
      bedrooms = isNaN(val) ? 1 : val
    }

    let beds = currentApartment.beds
    if (apartmentData.beds !== undefined) {
      const val = parseInt(String(apartmentData.beds), 10)
      beds = isNaN(val) ? 1 : val
    }

    let size = currentApartment.size
    if (apartmentData.size !== undefined) {
      if (apartmentData.size !== null && apartmentData.size !== '') {
        const val = parseInt(String(apartmentData.size), 10)
        size = isNaN(val) ? null : val
      } else {
        size = null
      }
    }

    let minStayNights = currentApartment.minStayNights
    if (apartmentData.minStayNights !== undefined) {
      const val = parseInt(String(apartmentData.minStayNights), 10)
      minStayNights = isNaN(val) ? 1 : val
    }

    let maxStayNights = currentApartment.maxStayNights
    if (apartmentData.maxStayNights !== undefined) {
      if (apartmentData.maxStayNights !== null && apartmentData.maxStayNights !== '') {
        const val = parseInt(String(apartmentData.maxStayNights), 10)
        maxStayNights = isNaN(val) ? null : val
      } else {
        maxStayNights = null
      }
    }

    // Float fields
    let price = currentApartment.price
    if (apartmentData.price !== undefined) {
      const val = parseFloat(String(apartmentData.price))
      price = isNaN(val) ? 0 : val
    }

    let cleaningFee = currentApartment.cleaningFee
    if (apartmentData.cleaningFee !== undefined) {
      const val = parseFloat(String(apartmentData.cleaningFee))
      cleaningFee = isNaN(val) ? 0 : val
    }

    let bathrooms = currentApartment.bathrooms
    if (apartmentData.bathrooms !== undefined) {
      const val = parseFloat(String(apartmentData.bathrooms))
      bathrooms = isNaN(val) ? 1 : val
    }

    let latitude = currentApartment.latitude
    if (apartmentData.latitude !== undefined) {
      if (apartmentData.latitude !== null && apartmentData.latitude !== '') {
        const val = parseFloat(String(apartmentData.latitude))
        latitude = isNaN(val) ? null : val
      } else {
        latitude = null
      }
    }

    let longitude = currentApartment.longitude
    if (apartmentData.longitude !== undefined) {
      if (apartmentData.longitude !== null && apartmentData.longitude !== '') {
        const val = parseFloat(String(apartmentData.longitude))
        longitude = isNaN(val) ? null : val
      } else {
        longitude = null
      }
    }

    // Boolean fields
    const isActive = apartmentData.isActive !== undefined ? Boolean(apartmentData.isActive) : currentApartment.isActive

    // Use raw SQL to update to avoid binary protocol issues
    await prisma.$executeRawUnsafe(`
      UPDATE "Apartment" SET
        "title" = $1,
        "description" = $2,
        "shortDescription" = $3,
        "theSpace" = $4,
        "guestAccess" = $5,
        "otherNotes" = $6,
        "price" = $7::double precision,
        "cleaningFee" = $8::double precision,
        "maxGuests" = $9::integer,
        "bedrooms" = $10::integer,
        "beds" = $11::integer,
        "bathrooms" = $12::double precision,
        "size" = $13::integer,
        "address" = $14,
        "city" = $15,
        "country" = $16,
        "latitude" = $17::double precision,
        "longitude" = $18::double precision,
        "minStayNights" = $19::integer,
        "maxStayNights" = $20::integer,
        "isActive" = $21::boolean,
        "airbnbId" = $22,
        "airbnbUrl" = $23,
        "bookingHorizon" = $24,
        "selectedRoomIds" = $25,
        "updatedAt" = NOW()
      WHERE "id" = $26
    `,
      title, description, shortDescription,
      theSpace, guestAccess, otherNotes,
      price, cleaningFee,
      maxGuests, bedrooms, beds, bathrooms, size,
      address, city, country,
      latitude, longitude,
      minStayNights, maxStayNights, isActive,
      airbnbId, airbnbUrl, bookingHorizon,
      selectedRoomIds, id
    )

    // Get updated apartment
    const updatedApartment = await prisma.apartment.findUnique({
      where: { id }
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