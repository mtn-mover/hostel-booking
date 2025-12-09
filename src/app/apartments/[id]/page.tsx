import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { RoomCollageGallery } from '@/components/apartments/room-collage-gallery'
import { AmenityList } from '@/components/apartments/amenity-list'
import { ReviewSection } from '@/components/reviews/review-section'
import { HelpSection } from '@/components/apartments/help-section'

interface ApartmentDetailProps {
  params: Promise<{ id: string }>
}

export default async function ApartmentDetailPage({ params }: ApartmentDetailProps) {
  const { id } = await params

  // Fetch apartment with images and room categories
  const [apartment, roomCategories] = await Promise.all([
    prisma.apartment.findUnique({
      where: {
        id: id,
        isActive: true
      },
      include: {
        apartmentImages: {
          orderBy: { order: 'asc' }
        },
        apartmentAmenities: {
          include: {
            amenity: true
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                name: true,
                image: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    }),
    prisma.roomCategory.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    })
  ])

  if (!apartment) {
    notFound()
  }

  // Parse JSON fields for legacy data
  const amenities = apartment.apartmentAmenities.length > 0
    ? apartment.apartmentAmenities.map(aa => aa.amenity.name)
    : JSON.parse(apartment.amenities || '[]')

  const averageRating = apartment.reviews.length > 0
    ? apartment.reviews.reduce((sum, review) => sum + review.rating, 0) / apartment.reviews.length
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link 
            href="/"
            className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to listings
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="mb-3">
            <h1 className="text-4xl font-semibold text-gray-900">
              {apartment.title || apartment.name}
              {apartment.shortDescription && (
                <span> - {apartment.shortDescription}</span>
              )}
            </h1>
          </div>
          {averageRating && (
            <div className="flex items-center gap-4 text-gray-600">
              <span className="flex items-center">
                ⭐ {averageRating.toFixed(1)} ({apartment.reviews.length} reviews)
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Main Image - Aligned with content */}
            {apartment.apartmentImages.length > 0 && (
              <div>
                <div className="h-[250px] md:h-[300px] rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={apartment.apartmentImages[0]?.url}
                    alt={apartment.title || apartment.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Room Collage Gallery - Aligned with content */}
            {apartment.apartmentImages.length > 0 && (
              <div>
                <RoomCollageGallery
                  images={apartment.apartmentImages}
                  roomCategories={roomCategories}
                  apartmentName={apartment.title || apartment.name || 'Apartment'}
                />
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-semibold mb-4">About this place</h2>
              <p className="text-gray-700 whitespace-pre-line">
                {apartment.description}
              </p>
            </div>

            {/* Features */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-semibold mb-4">Features</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-2">🛏️</span>
                  <div>
                    <div className="font-medium">{apartment.bedrooms} Bedrooms</div>
                    <div className="text-sm text-gray-600">{apartment.beds} Beds</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl mr-2">🚿</span>
                  <div>
                    <div className="font-medium">{apartment.bathrooms} Bathrooms</div>
                    <div className="text-sm text-gray-600">Private</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl mr-2">📏</span>
                  <div>
                    <div className="font-medium">{apartment.size || 'N/A'} m²</div>
                    <div className="text-sm text-gray-600">Living space</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl mr-2">👥</span>
                  <div>
                    <div className="font-medium">{apartment.maxGuests} Guests</div>
                    <div className="text-sm text-gray-600">Maximum</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
                <AmenityList amenities={amenities} />
              </div>
            )}

            {/* Reviews */}
            <ReviewSection reviews={apartment.reviews} />
          </div>

          {/* Right Column - Airbnb Booking Link */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Diese Unterkunft buchen
                </h3>

                {apartment.airbnbUrl ? (
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      Buchen Sie diese Unterkunft direkt bei Airbnb. Dort finden Sie aktuelle Preise und Verfuegbarkeit.
                    </p>

                    <a
                      href={apartment.airbnbUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white text-center py-4 px-6 rounded-lg font-semibold text-lg hover:from-rose-600 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
                    >
                      Auf Airbnb buchen
                    </a>

                    <p className="text-sm text-gray-500 text-center">
                      Sie werden zu Airbnb weitergeleitet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      Diese Unterkunft ist derzeit nicht zur Online-Buchung verfuegbar.
                    </p>

                    <div className="bg-gray-100 rounded-lg p-4">
                      <p className="text-sm text-gray-600">
                        Bitte kontaktieren Sie uns direkt fuer Buchungsanfragen.
                      </p>
                    </div>
                  </div>
                )}

                {/* Location Info */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📍</span>
                    <div>
                      <h4 className="font-medium text-gray-900">Standort</h4>
                      <p className="text-gray-600">
                        {apartment.city}, {apartment.country}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Help Section */}
              <HelpSection />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}