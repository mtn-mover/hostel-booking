import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'

interface ComparisonApartment {
  id: string
  title: string
  description: string
  price: number
  maxGuests: number
  bedrooms: number
  beds: number
  bathrooms: number
  size: number | null
  cleaningFee: number
  minStayNights: number
  images: string[]
  amenities: string[]
  airbnbId: string | null
  airbnbUrl: string | null
  rating: number | null
  reviewCount: number
  city: string
  address: string | null
}

export async function ApartmentComparison() {
  const apartments = await prisma.apartment.findMany({
    where: {
      isActive: true,
      airbnbId: { not: null } // Only show imported Airbnb apartments
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
        <h3 className="text-xl font-medium text-gray-900 mb-2">No apartments to compare</h3>
        <p className="text-gray-500 mb-6">Import apartments first to see the comparison</p>
        <Link 
          href="/admin/import"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Import Apartments
        </Link>
      </div>
    )
  }

  const processedApartments: ComparisonApartment[] = apartments.map(apartment => ({
    ...apartment,
    images: JSON.parse(apartment.images || '[]'),
    amenities: JSON.parse(apartment.amenities || '[]'),
    reviewCount: apartment.reviews.length,
    rating: apartment.rating || (apartment.reviews.length > 0 
      ? apartment.reviews.reduce((sum, review) => sum + review.rating, 0) / apartment.reviews.length
      : null)
  }))

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="sticky left-0 bg-gray-50 px-6 py-4 text-left font-semibold text-gray-900 border-r border-gray-200">
                Features
              </th>
              {processedApartments.map((apartment) => (
                <th key={apartment.id} className="px-4 py-4 text-center min-w-[280px] bg-gray-50">
                  <div className="space-y-3">
                    <div className="relative h-32 rounded-lg overflow-hidden bg-gray-200">
                      {apartment.images[0] ? (
                        <Image
                          src={apartment.images[0]}
                          alt={apartment.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{apartment.title}</h3>
                      {apartment.airbnbId && (
                        <p className="text-sm text-blue-600">Airbnb ID: {apartment.airbnbId}</p>
                      )}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Pricing */}
            <tr className="border-b border-gray-100 hover:bg-gray-50">
              <td className="sticky left-0 bg-white px-6 py-4 font-medium text-gray-900 border-r border-gray-200">
                Price per Night
              </td>
              {processedApartments.map((apartment) => (
                <td key={apartment.id} className="px-4 py-4 text-center">
                  <span className="text-xl font-bold text-green-600">
                    {formatPrice(apartment.price)}
                  </span>
                </td>
              ))}
            </tr>

            {/* Cleaning Fee */}
            <tr className="border-b border-gray-100 hover:bg-gray-50">
              <td className="sticky left-0 bg-white px-6 py-4 font-medium text-gray-900 border-r border-gray-200">
                Cleaning Fee
              </td>
              {processedApartments.map((apartment) => (
                <td key={apartment.id} className="px-4 py-4 text-center">
                  {formatPrice(apartment.cleaningFee)}
                </td>
              ))}
            </tr>

            {/* Capacity */}
            <tr className="border-b border-gray-100 hover:bg-gray-50">
              <td className="sticky left-0 bg-white px-6 py-4 font-medium text-gray-900 border-r border-gray-200">
                Maximum Guests
              </td>
              {processedApartments.map((apartment) => (
                <td key={apartment.id} className="px-4 py-4 text-center">
                  {apartment.maxGuests} guests
                </td>
              ))}
            </tr>

            {/* Bedrooms */}
            <tr className="border-b border-gray-100 hover:bg-gray-50">
              <td className="sticky left-0 bg-white px-6 py-4 font-medium text-gray-900 border-r border-gray-200">
                Bedrooms
              </td>
              {processedApartments.map((apartment) => (
                <td key={apartment.id} className="px-4 py-4 text-center">
                  {apartment.bedrooms} bedroom{apartment.bedrooms !== 1 ? 's' : ''}
                </td>
              ))}
            </tr>

            {/* Beds */}
            <tr className="border-b border-gray-100 hover:bg-gray-50">
              <td className="sticky left-0 bg-white px-6 py-4 font-medium text-gray-900 border-r border-gray-200">
                Beds
              </td>
              {processedApartments.map((apartment) => (
                <td key={apartment.id} className="px-4 py-4 text-center">
                  {apartment.beds} bed{apartment.beds !== 1 ? 's' : ''}
                </td>
              ))}
            </tr>

            {/* Bathrooms */}
            <tr className="border-b border-gray-100 hover:bg-gray-50">
              <td className="sticky left-0 bg-white px-6 py-4 font-medium text-gray-900 border-r border-gray-200">
                Bathrooms
              </td>
              {processedApartments.map((apartment) => (
                <td key={apartment.id} className="px-4 py-4 text-center">
                  {apartment.bathrooms} bathroom{apartment.bathrooms !== 1 ? 's' : ''}
                </td>
              ))}
            </tr>

            {/* Size */}
            <tr className="border-b border-gray-100 hover:bg-gray-50">
              <td className="sticky left-0 bg-white px-6 py-4 font-medium text-gray-900 border-r border-gray-200">
                Size
              </td>
              {processedApartments.map((apartment) => (
                <td key={apartment.id} className="px-4 py-4 text-center">
                  {apartment.size ? `${apartment.size} m²` : 'Not specified'}
                </td>
              ))}
            </tr>

            {/* Minimum Stay */}
            <tr className="border-b border-gray-100 hover:bg-gray-50">
              <td className="sticky left-0 bg-white px-6 py-4 font-medium text-gray-900 border-r border-gray-200">
                Minimum Stay
              </td>
              {processedApartments.map((apartment) => (
                <td key={apartment.id} className="px-4 py-4 text-center">
                  {apartment.minStayNights} night{apartment.minStayNights !== 1 ? 's' : ''}
                </td>
              ))}
            </tr>

            {/* Rating */}
            <tr className="border-b border-gray-100 hover:bg-gray-50">
              <td className="sticky left-0 bg-white px-6 py-4 font-medium text-gray-900 border-r border-gray-200">
                Rating
              </td>
              {processedApartments.map((apartment) => (
                <td key={apartment.id} className="px-4 py-4 text-center">
                  {apartment.rating ? (
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="font-medium">{apartment.rating.toFixed(1)}</span>
                      <span className="text-gray-500 text-sm">({apartment.reviewCount})</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">No ratings</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Amenities */}
            <tr className="border-b border-gray-100 hover:bg-gray-50">
              <td className="sticky left-0 bg-white px-6 py-4 font-medium text-gray-900 border-r border-gray-200">
                Top Amenities
              </td>
              {processedApartments.map((apartment) => (
                <td key={apartment.id} className="px-4 py-4">
                  <div className="space-y-1">
                    {apartment.amenities.slice(0, 5).map((amenity, index) => (
                      <div key={index} className="text-sm text-gray-600 flex items-center">
                        <span className="text-green-500 mr-1">✓</span>
                        {amenity}
                      </div>
                    ))}
                    {apartment.amenities.length > 5 && (
                      <div className="text-xs text-gray-400 mt-2">
                        +{apartment.amenities.length - 5} more amenities
                      </div>
                    )}
                  </div>
                </td>
              ))}
            </tr>

            {/* Location */}
            <tr className="border-b border-gray-100 hover:bg-gray-50">
              <td className="sticky left-0 bg-white px-6 py-4 font-medium text-gray-900 border-r border-gray-200">
                Location
              </td>
              {processedApartments.map((apartment) => (
                <td key={apartment.id} className="px-4 py-4 text-center text-sm">
                  <div>{apartment.city}</div>
                  {apartment.address && (
                    <div className="text-gray-500 text-xs mt-1">{apartment.address}</div>
                  )}
                </td>
              ))}
            </tr>

            {/* Actions */}
            <tr>
              <td className="sticky left-0 bg-white px-6 py-4 font-medium text-gray-900 border-r border-gray-200">
                Actions
              </td>
              {processedApartments.map((apartment) => (
                <td key={apartment.id} className="px-4 py-4 text-center">
                  <div className="space-y-2">
                    <Link
                      href={`/apartments/${apartment.id}`}
                      className="block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                    >
                      View Details
                    </Link>
                    {apartment.airbnbUrl && (
                      <a
                        href={apartment.airbnbUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition"
                      >
                        View on Airbnb
                      </a>
                    )}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}