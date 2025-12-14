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
        price: data.price || 0,
        cleaningFee: data.cleaningFee || 0,
        maxGuests: data.maxGuests || 2,
        bedrooms: data.bedrooms || 1,
        beds: data.beds || 1,
        bathrooms: data.bathrooms || 1,
        size: data.size || null,
        address: data.address || null,
        city: data.city || 'Grindelwald',
        country: data.country || 'Schweiz',
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        minStayNights: data.minStayNights || 1,
        maxStayNights: data.maxStayNights || null,
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