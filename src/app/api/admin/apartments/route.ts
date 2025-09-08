import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Create the apartment
    const apartment = await prisma.apartment.create({
      data: {
        title: data.title,
        name: data.name,
        description: data.description,
        shortDescription: data.description.substring(0, 150),
        price: data.price,
        maxGuests: data.maxGuests,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        size: data.size || null,
        floor: data.floor || null,
        roomNumber: data.roomNumber || null,
        address: data.address || null,
        city: data.city,
        postalCode: data.postalCode || null,
        country: data.country,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        checkInTime: data.checkInTime || '15:00',
        checkOutTime: data.checkOutTime || '11:00',
        bookingHorizon: data.bookingHorizon || 365,
        minStayNights: data.minStayNights || 1,
        maxStayNights: data.maxStayNights || null,
        serviceFeePercentage: data.serviceFeePercentage || 10,
        isActive: data.isActive ?? true,
        mainImage: data.mainImage || null,
        airbnbListingId: data.airbnbListingId || null,
        airbnbSyncEnabled: data.airbnbSyncEnabled || false,
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
    return NextResponse.json(
      { error: 'Failed to create apartment' },
      { status: 500 }
    )
  }
}