import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const apartments = await prisma.apartment.findMany({
      include: {
        apartmentImages: {
          where: { isMain: true },
          take: 1
        },
        _count: {
          select: {
            bookings: true,
            reviews: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(apartments)
  } catch (error) {
    console.error('Error fetching apartments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch apartments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Parse numeric values to ensure correct types
    const price = parseFloat(data.price) || 0
    const cleaningFee = parseFloat(data.cleaningFee) || 0
    const maxGuests = parseInt(data.maxGuests) || 2
    const bedrooms = parseInt(data.bedrooms) || 1
    const beds = parseInt(data.beds) || 1
    const bathrooms = parseFloat(data.bathrooms) || 1
    const size = data.size ? parseFloat(data.size) : null
    const latitude = data.latitude ? parseFloat(data.latitude) : null
    const longitude = data.longitude ? parseFloat(data.longitude) : null
    const minStayNights = parseInt(data.minStayNights) || 1
    const maxStayNights = data.maxStayNights ? parseInt(data.maxStayNights) : null

    // Create the apartment with only fields that exist in schema
    const apartment = await prisma.apartment.create({
      data: {
        title: data.title,
        name: data.name || data.title,
        description: data.description,
        shortDescription: data.shortDescription || data.description?.substring(0, 150) || '',
        theSpace: data.theSpace || null,
        guestAccess: data.guestAccess || null,
        otherNotes: data.otherNotes || null,
        price,
        cleaningFee,
        maxGuests,
        bedrooms,
        beds,
        bathrooms,
        size,
        address: data.address || null,
        city: data.city || 'Grindelwald',
        country: data.country || 'Schweiz',
        latitude,
        longitude,
        minStayNights,
        maxStayNights,
        isActive: data.isActive ?? false,
        airbnbId: data.airbnbId || null,
        airbnbUrl: data.airbnbUrl || null,
        // Legacy fields for compatibility
        images: '[]',
        amenities: '[]'
      }
    })

    // Create amenity relationships if provided
    if (data.amenityIds && data.amenityIds.length > 0) {
      // Validate that amenities exist
      const existingAmenities = await prisma.amenity.findMany({
        where: { id: { in: data.amenityIds } }
      })

      const validAmenityIds = existingAmenities.map(a => a.id)
      
      if (validAmenityIds.length > 0) {
        await prisma.apartmentAmenity.createMany({
          data: validAmenityIds.map(amenityId => ({
            apartmentId: apartment.id,
            amenityId
          }))
        })
      }
    }

    return NextResponse.json(apartment)
  } catch (error) {
    console.error('Error creating apartment:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to create apartment', message: `Fehler beim Erstellen: ${errorMessage}` },
      { status: 500 }
    )
  }
}