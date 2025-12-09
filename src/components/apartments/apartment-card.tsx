import Image from 'next/image'
import Link from 'next/link'

interface ApartmentCardProps {
  apartment: {
    id: string
    title: string
    description: string
    shortDescription: string | null
    maxGuests: number
    bedrooms: number
    bathrooms: number
    price: number
    currentPrice?: number
    officialPrice?: number
    hasSeasonalPrice?: boolean
    seasonName?: string | null
    images: string[]
    amenities: string[]
    averageRating: number | null
    reviewCount: number
  }
}

export function ApartmentCard({ apartment }: ApartmentCardProps) {
  const mainImage = apartment.images[0]
  const topAmenities = apartment.amenities.slice(0, 3)

  return (
    <Link href={`/apartments/${apartment.id}`} className="group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        {/* Image */}
        <div className="relative h-48 bg-gray-200">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={apartment.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <span className="text-gray-400 text-lg">No Image</span>
            </div>
          )}
          
          {/* Rating Badge */}
          {apartment.averageRating && (
            <div className="absolute top-2 left-2 bg-white bg-opacity-90 rounded-full px-2 py-1 flex items-center gap-1">
              <span className="text-yellow-500">★</span>
              <span className="text-sm font-medium">
                {apartment.averageRating.toFixed(1)}
              </span>
              <span className="text-xs text-gray-500">
                ({apartment.reviewCount})
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {apartment.title}
          </h3>
          
          {apartment.shortDescription && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {apartment.shortDescription}
            </p>
          )}

          {/* Apartment Details */}
          <div className="flex items-center text-sm text-gray-500 mb-3 gap-4">
            <span>{apartment.maxGuests} guests</span>
            <span>{apartment.bedrooms} bed{apartment.bedrooms !== 1 ? 's' : ''}</span>
            <span>{apartment.bathrooms} bath{apartment.bathrooms !== 1 ? 's' : ''}</span>
          </div>

          {/* Amenities */}
          {topAmenities.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {topAmenities.map((amenity, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                >
                  {amenity}
                </span>
              ))}
              {apartment.amenities.length > 3 && (
                <span className="text-gray-500 text-xs">
                  +{apartment.amenities.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* View Details Button */}
          <div className="flex justify-end">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
              View Details
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}