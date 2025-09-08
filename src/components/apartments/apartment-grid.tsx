import { prisma } from '@/lib/prisma'
import { ApartmentCard } from './apartment-card'

export async function ApartmentGrid() {
  const apartments = await prisma.apartment.findMany({
    where: {
      isActive: true
    },
    include: {
      reviews: {
        select: {
          rating: true
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
      {apartments.map((apartment) => (
        <ApartmentCard
          key={apartment.id}
          apartment={{
            ...apartment,
            images: JSON.parse(apartment.images || '[]'),
            amenities: JSON.parse(apartment.amenities || '[]'),
            averageRating: apartment.reviews.length > 0 
              ? apartment.reviews.reduce((sum, review) => sum + review.rating, 0) / apartment.reviews.length
              : null,
            reviewCount: apartment.reviews.length
          }}
        />
      ))}
    </div>
  )
}