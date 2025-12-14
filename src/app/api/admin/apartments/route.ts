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

    // Prepare string values
    const title = String(data.title || '')
    const name = String(data.name || data.title || '')
    const description = String(data.description || '')
    const shortDescription = data.shortDescription ? String(data.shortDescription) : (data.description?.substring(0, 150) || '')
    const theSpace = data.theSpace ? String(data.theSpace) : null
    const guestAccess = data.guestAccess ? String(data.guestAccess) : null
    const otherNotes = data.otherNotes ? String(data.otherNotes) : null
    const address = data.address ? String(data.address) : null
    const city = String(data.city || 'Grindelwald')
    const country = String(data.country || 'Schweiz')
    const isActive = Boolean(data.isActive ?? false)
    const airbnbId = data.airbnbId ? String(data.airbnbId) : null
    const airbnbUrl = data.airbnbUrl ? String(data.airbnbUrl) : null

    // Generate a unique ID
    const apartmentId = `apt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    // Create apartment using raw SQL to avoid binary protocol issues with Prisma Accelerate
    // Use text protocol by casting all values explicitly
    await prisma.$executeRawUnsafe(`
      INSERT INTO "Apartment" (
        "id", "title", "name", "description", "shortDescription",
        "theSpace", "guestAccess", "otherNotes",
        "price", "cleaningFee", "maxGuests", "bedrooms", "beds", "bathrooms", "size",
        "address", "city", "country", "latitude", "longitude",
        "minStayNights", "maxStayNights", "isActive",
        "airbnbId", "airbnbUrl", "images", "amenities",
        "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8,
        $9::double precision, $10::double precision,
        $11::integer, $12::integer, $13::integer,
        $14::double precision, $15::integer,
        $16, $17, $18,
        $19::double precision, $20::double precision,
        $21::integer, $22::integer, $23::boolean,
        $24, $25, '[]', '[]',
        NOW(), NOW()
      )
    `,
      apartmentId,
      title, name, description, shortDescription,
      theSpace, guestAccess, otherNotes,
      finalPrice, finalCleaningFee,
      finalMaxGuests, finalBedrooms, finalBeds,
      finalBathrooms, finalSize,
      address, city, country,
      finalLatitude, finalLongitude,
      finalMinStayNights, finalMaxStayNights, isActive,
      airbnbId, airbnbUrl
    )

    // Get the created apartment
    const apartment = await prisma.apartment.findUnique({
      where: { id: apartmentId }
    })

    if (!apartment) {
      throw new Error('Failed to create apartment - could not retrieve after insert')
    }

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