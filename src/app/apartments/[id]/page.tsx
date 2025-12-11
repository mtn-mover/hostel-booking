import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ImageGallery } from '@/components/apartment/ImageGallery'
import { AmenitiesSection } from '@/components/apartment/AmenitiesSection'
import { WhereYoullSleep } from '@/components/apartment/WhereYoullSleep'
import { ReviewSection } from '@/components/reviews/review-section'
import { HelpSection } from '@/components/apartments/help-section'

interface ApartmentDetailProps {
  params: Promise<{ id: string }>
}

export default async function ApartmentDetailPage({ params }: ApartmentDetailProps) {
  const { id } = await params

  // Fetch apartment with images
  const apartment = await prisma.apartment.findUnique({
    where: {
      id: id,
      isActive: true
    },
    include: {
      apartmentImages: {
        orderBy: [{ roomId: 'asc' }, { order: 'asc' }],
        include: {
          room: true
        }
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
      },
      bedroomDetails: {
        orderBy: { order: 'asc' }
      }
    }
  })

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
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
            {apartment.title || apartment.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            {averageRating && (
              <>
                <span className="flex items-center font-medium">
                  ⭐ {averageRating.toFixed(2)}
                </span>
                <span className="text-gray-400">·</span>
                <span className="underline cursor-pointer hover:text-gray-900">
                  {apartment.reviews.length} reviews
                </span>
                <span className="text-gray-400">·</span>
              </>
            )}
            <span className="underline cursor-pointer hover:text-gray-900">
              {apartment.city}, {apartment.country}
            </span>
          </div>
        </div>

        {/* Image Gallery - Full Width like Airbnb */}
        {apartment.apartmentImages.length > 0 && (
          <div className="mb-8">
            <ImageGallery
              images={apartment.apartmentImages.map(img => ({
                url: img.url,
                alt: img.alt || undefined,
                roomName: img.room?.nameEn || img.room?.name || undefined
              }))}
              apartmentName={apartment.title || apartment.name || 'Apartment'}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-8">
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

            {/* Where you'll sleep */}
            {apartment.bedroomDetails.length > 0 && (
              <WhereYoullSleep bedrooms={apartment.bedroomDetails} />
            )}

            {/* Amenities */}
            {amenities.length > 0 && (
              <AmenitiesSection amenities={amenities} />
            )}

            {/* Reviews */}
            <ReviewSection reviews={apartment.reviews} />
          </div>

          {/* Right Column - Airbnb Booking Link */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Please book your stay at
                </h3>

                <a
                  href={apartment.airbnbUrl || 'https://www.airbnb.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white text-center py-4 px-6 rounded-lg font-semibold text-lg hover:from-rose-600 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
                >
                  Airbnb
                </a>

                <p className="text-sm text-gray-500 text-center mt-4">
                  You will be redirected to Airbnb
                </p>

                {/* Location Info */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📍</span>
                    <div>
                      <h4 className="font-medium text-gray-900">Location</h4>
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