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

    // Log incoming data for debugging
    console.log('Creating apartment with data:', JSON.stringify(data, null, 2))

    // Parse numeric values to ensure correct types for PostgreSQL
    // IMPORTANT: All values must be proper numbers, not strings or NaN
    const price = Number(data.price) || 0
    const cleaningFee = Number(data.cleaningFee) || 0
    const maxGuests = Math.floor(Number(data.maxGuests)) || 2
    const bedrooms = Math.floor(Number(data.bedrooms)) || 1
    const beds = Math.floor(Number(data.beds)) || 1
    const bathrooms = Number(data.bathrooms) || 1
    const size = data.size ? Math.floor(Number(data.size)) : null
    const latitude = data.latitude ? Number(data.latitude) : null
    const longitude = data.longitude ? Number(data.longitude) : null
    const minStayNights = Math.floor(Number(data.minStayNights)) || 1
    const maxStayNights = data.maxStayNights ? Math.floor(Number(data.maxStayNights)) : null

    // Validate that numbers are not NaN
    if (isNaN(price) || isNaN(cleaningFee) || isNaN(maxGuests) || isNaN(bedrooms) ||
        isNaN(beds) || isNaN(bathrooms) || isNaN(minStayNights)) {
      console.error('Invalid numeric values:', { price, cleaningFee, maxGuests, bedrooms, beds, bathrooms, minStayNights })
      return NextResponse.json(
        { error: 'Invalid numeric values', message: 'Bitte überprüfen Sie die Zahlenwerte' },
        { status: 400 }
      )
    }

    console.log('Parsed values:', { price, cleaningFee, maxGuests, bedrooms, beds, bathrooms, size, minStayNights, maxStayNights })

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