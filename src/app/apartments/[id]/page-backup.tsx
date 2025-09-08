import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ApartmentGallery } from '@/components/apartments/apartment-gallery'
import { BookingForm } from '@/components/booking/booking-form'
import { AmenityList } from '@/components/apartments/amenity-list'
import { ReviewSection } from '@/components/reviews/review-section'
import { PricingTable } from '@/components/booking/pricing-table'
import { CompactRoomGallery } from '@/components/apartments/compact-room-gallery'
import { formatPrice } from '@/lib/utils'

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
        },
        availabilities: {
          where: {
            date: {
              gte: new Date()
            }
          },
          orderBy: {
            date: 'asc'
          },
          take: 30 // Next 30 days
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
  const legacyImages = JSON.parse(apartment.images || '[]')
  const amenities = apartment.apartmentAmenities.length > 0
    ? apartment.apartmentAmenities.map(aa => aa.amenity.name)
    : JSON.parse(apartment.amenities || '[]')

  // Use apartment images if available, otherwise use legacy images
  const displayImages = apartment.apartmentImages.length > 0 
    ? apartment.apartmentImages.map(img => img.url)
    : legacyImages

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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {apartment.title || apartment.name}
          </h1>
          <div className="flex items-center gap-4 text-gray-600">
            <span className="flex items-center">
              📍 {apartment.city}, {apartment.country}
            </span>
            {averageRating && (
              <span className="flex items-center">
                ⭐ {averageRating.toFixed(1)} ({apartment.reviews.length} reviews)
              </span>
            )}
            <span className="flex items-center">
              👥 Up to {apartment.maxGuests} guests
            </span>
          </div>
        </div>

        {/* Main Gallery - Compact */}
        {displayImages.length > 0 && (
          <div className="mb-6">
            <div className="h-[400px] overflow-hidden rounded-lg">
              <ApartmentGallery images={displayImages} />
            </div>
          </div>
        )}

        {/* Compact Room Gallery */}
        {apartment.apartmentImages.length > 0 && (
          <div className="mb-6">
            <CompactRoomGallery
              images={apartment.apartmentImages}
              roomCategories={roomCategories}
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

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
                <AmenityList amenities={amenities} />
              </div>
            )}

            {/* Pricing */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-semibold mb-4">Pricing</h2>
              <PricingTable apartment={apartment} />
            </div>

            {/* Reviews */}
            <ReviewSection reviews={apartment.reviews} />
          </div>

          {/* Right Column - Booking */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="mb-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-bold">
                      {formatPrice(apartment.price)}
                    </span>
                    <span className="text-gray-600">/ night</span>
                  </div>
                  {apartment.cleaningFee > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      + {formatPrice(apartment.cleaningFee)} cleaning fee
                    </p>
                  )}
                </div>

                <BookingForm 
                  apartment={apartment}
                  availabilities={apartment.availabilities}
                />
              </div>

              {/* Host Info */}
              <div className="bg-white rounded-lg shadow-sm p-6 mt-4">
                <h3 className="font-semibold mb-3">Need Help?</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Our team is here to help you with your booking.
                </p>
                <a
                  href="https://wa.me/41798016570"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  <span className="mr-2">💬</span>
                  WhatsApp Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}