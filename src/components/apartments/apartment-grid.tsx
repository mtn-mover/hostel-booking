import { prisma } from '@/lib/prisma'
import { ApartmentCard } from './apartment-card'

export async function ApartmentGrid() {
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0]
  
  const apartments = await prisma.apartment.findMany({
    where: {
      isActive: true
    },
    include: {
      reviews: {
        select: {
          rating: true
        }
      },
      seasonPrices: {
        where: {
          isActive: true,
          startDate: {
            lte: today
          },
          endDate: {
            gt: today  // Changed from gte to gt (exclusive end date)
          }
        },
        orderBy: {
          priority: 'desc'
        }
      },
      eventPrices: {
        where: {
          isActive: true,
          startDate: {
            lte: today
          },
          endDate: {
            gt: today  // Changed from gte to gt (exclusive end date)
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  if (apartments.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-gray-900 mb-2">No apartments found</h3>
        <p className="text-gray-500">Try adjusting your search filters</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {apartments.map((apartment) => {
        // Determine current price
        // Always show seasonal price if available (even on event days)
        // Never show event price directly
        let currentPrice = apartment.price // Official price as fallback
        let hasSeasonalPrice = false
        
        // Check for seasonal price (always show if available)
        const seasonPrice = apartment.seasonPrices.length > 0 ? apartment.seasonPrices[0] : null
        
        if (seasonPrice) {
          // Always use seasonal price if available (regardless of event prices)
          currentPrice = seasonPrice.price
          hasSeasonalPrice = true
        }
        
        return (
          <ApartmentCard
            key={apartment.id}
            apartment={{
              ...apartment,
              images: JSON.parse(apartment.images || '[]'),
              amenities: JSON.parse(apartment.amenities || '[]'),
              averageRating: apartment.reviews.length > 0 
                ? apartment.reviews.reduce((sum, review) => sum + review.rating, 0) / apartment.reviews.length
                : null,
              reviewCount: apartment.reviews.length,
              currentPrice,
              officialPrice: apartment.price,
              hasSeasonalPrice,
              seasonName: seasonPrice?.name || null
            }}
          />
        )
      })}
    </div>
  )
}