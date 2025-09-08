import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSeasonPriceForDate } from '@/lib/pricing'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const checkIn = searchParams.get('checkIn')
    const checkOut = searchParams.get('checkOut')
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Fetch all active apartments
    let apartments = await prisma.apartment.findMany({
      where: {
        isActive: true
      },
      include: {
        reviews: {
          select: {
            rating: true
          }
        },
        apartmentImages: {
          where: {
            isMain: true
          },
          select: {
            url: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Filter by availability if dates are provided
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn)
      const checkOutDate = new Date(checkOut)
      
      // Get apartments that have bookings in the selected period
      const bookedApartmentIds = await prisma.booking.findMany({
        where: {
          AND: [
            {
              status: {
                in: ['CONFIRMED', 'PENDING']
              }
            },
            {
              OR: [
                {
                  AND: [
                    { checkIn: { lte: checkInDate } },
                    { checkOut: { gt: checkInDate } }
                  ]
                },
                {
                  AND: [
                    { checkIn: { lt: checkOutDate } },
                    { checkOut: { gte: checkOutDate } }
                  ]
                },
                {
                  AND: [
                    { checkIn: { gte: checkInDate } },
                    { checkOut: { lte: checkOutDate } }
                  ]
                }
              ]
            }
          ]
        },
        select: {
          apartmentId: true
        }
      })
      
      const bookedIds = bookedApartmentIds.map(b => b.apartmentId)
      
      // Filter out booked apartments
      apartments = apartments.filter(apt => !bookedIds.includes(apt.id))
    }

    // Calculate average ratings and current prices
    const apartmentsWithDetails = await Promise.all(
      apartments.map(async (apartment) => {
        // Calculate average rating
        const averageRating = apartment.reviews.length > 0
          ? apartment.reviews.reduce((sum, review) => sum + review.rating, 0) / apartment.reviews.length
          : null

        // Get current season price (excluding event prices)
        const currentPrice = await getSeasonPriceForDate(
          apartment.id,
          today,
          apartment.price
        )

        // Get main image
        const mainImage = apartment.mainImage || 
          (apartment.apartmentImages.length > 0 ? apartment.apartmentImages[0].url : null) ||
          (apartment.images ? JSON.parse(apartment.images)[0] : null)

        return {
          id: apartment.id,
          title: apartment.title || apartment.name,
          name: apartment.name,
          description: apartment.description,
          price: apartment.price,
          currentPrice: currentPrice,
          originalPrice: apartment.price,
          maxGuests: apartment.maxGuests,
          bedrooms: apartment.bedrooms,
          bathrooms: apartment.bathrooms,
          mainImage: mainImage,
          rating: averageRating ? parseFloat(averageRating.toFixed(1)) : null,
          reviewCount: apartment.reviews.length
        }
      })
    )

    return NextResponse.json(apartmentsWithDetails)
  } catch (error) {
    console.error('Error fetching apartments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch apartments' },
      { status: 500 }
    )
  }
}