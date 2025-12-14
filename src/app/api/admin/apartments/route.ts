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
    // IMPORTANT: All values must be proper JavaScript numbers (not strings or NaN)
    // Integer fields: maxGuests, bedrooms, beds, size, minStayNights, maxStayNights
    // Float fields: price, cleaningFee, bathrooms, latitude, longitude

    // Parse and validate integers
    const maxGuests = parseInt(String(data.maxGuests), 10)
    const bedrooms = parseInt(String(data.bedrooms), 10)
    const beds = parseInt(String(data.beds), 10)
    const minStayNights = parseInt(String(data.minStayNights), 10)

    // Optional integers
    const size = data.size !== undefined && data.size !== null && data.size !== ''
      ? parseInt(String(data.size), 10)
      : null
    const maxStayNights = data.maxStayNights !== undefined && data.maxStayNights !== null && data.maxStayNights !== ''
      ? parseInt(String(data.maxStayNights), 10)
      : null

    // Parse floats
    const price = parseFloat(String(data.price))
    const cleaningFee = parseFloat(String(data.cleaningFee))
    const bathrooms = parseFloat(String(data.bathrooms))

    // Optional floats
    const latitude = data.latitude !== undefined && data.latitude !== null && data.latitude !== ''
      ? parseFloat(String(data.latitude))
      : null
    const longitude = data.longitude !== undefined && data.longitude !== null && data.longitude !== ''
      ? parseFloat(String(data.longitude))
      : null

    // Apply defaults for required fields if NaN
    const finalMaxGuests = isNaN(maxGuests) ? 2 : maxGuests
    const finalBedrooms = isNaN(bedrooms) ? 1 : bedrooms
    const finalBeds = isNaN(beds) ? 1 : beds
    const finalBathrooms = isNaN(bathrooms) ? 1.0 : bathrooms
    const finalPrice = isNaN(price) ? 0.0 : price
    const finalCleaningFee = isNaN(cleaningFee) ? 0.0 : cleaningFee
    const finalMinStayNights = isNaN(minStayNights) ? 1 : minStayNights
    const finalSize = size !== null && !isNaN(size) ? size : null
    const finalMaxStayNights = maxStayNights !== null && !isNaN(maxStayNights) ? maxStayNights : null
    const finalLatitude = latitude !== null && !isNaN(latitude) ? latitude : null
    const finalLongitude = longitude !== null && !isNaN(longitude) ? longitude : null

    console.log('Parsed values:', {
      maxGuests: finalMaxGuests,
      bedrooms: finalBedrooms,
      beds: finalBeds,
      bathrooms: finalBathrooms,
      price: finalPrice,
      cleaningFee: finalCleaningFee,
      size: finalSize,
      minStayNights: finalMinStayNights,
      maxStayNights: finalMaxStayNights,
      latitude: finalLatitude,
      longitude: finalLongitude
    })

    // Create the apartment with only fields that exist in schema
    const apartment = await prisma.apartment.create({
      data: {
        title: String(data.title || ''),
        name: String(data.name || data.title || ''),
        description: String(data.description || ''),
        shortDescription: data.shortDescription ? String(data.shortDescription) : (data.description?.substring(0, 150) || ''),
        theSpace: data.theSpace ? String(data.theSpace) : null,
        guestAccess: data.guestAccess ? String(data.guestAccess) : null,
        otherNotes: data.otherNotes ? String(data.otherNotes) : null,
        price: finalPrice,
        cleaningFee: finalCleaningFee,
        maxGuests: finalMaxGuests,
        bedrooms: finalBedrooms,
        beds: finalBeds,
        bathrooms: finalBathrooms,
        size: finalSize,
        address: data.address ? String(data.address) : null,
        city: String(data.city || 'Grindelwald'),
        country: String(data.country || 'Schweiz'),
        latitude: finalLatitude,
        longitude: finalLongitude,
        minStayNights: finalMinStayNights,
        maxStayNights: finalMaxStayNights,
        isActive: Boolean(data.isActive ?? false),
        airbnbId: data.airbnbId ? String(data.airbnbId) : null,
        airbnbUrl: data.airbnbUrl ? String(data.airbnbUrl) : null,
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