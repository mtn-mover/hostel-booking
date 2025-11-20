import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { RoomCollageGallery } from '@/components/apartments/room-collage-gallery'
import { BookingForm } from '@/components/booking/booking-form'
import { AmenityList } from '@/components/apartments/amenity-list'
import { ReviewSection } from '@/components/reviews/review-section'
import { PricingTable } from '@/components/booking/pricing-table'
import { HelpSection } from '@/components/apartments/help-section'
import { formatPrice } from '@/lib/utils'
import { getPriceForDate } from '@/lib/pricing'

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
          take: 730 // Show availability for up to 2 years
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

  // Debug: Log the booking horizon
  console.log('Apartment booking horizon:', apartment.bookingHorizon)

  // Parse JSON fields for legacy data
  const legacyImages = JSON.parse(apartment.images || '[]')
  const amenities = apartment.apartmentAmenities.length > 0
    ? apartment.apartmentAmenities.map(aa => aa.amenity.name)
    : JSON.parse(apartment.amenities || '[]')

  // Use apartment images if available, otherwise use legacy images
  const displayImages = apartment.apartmentImages.length > 0 
    ? apartment.apartmentImages.map(img => img.url)
    : legacyImages
  
  // Generate availability data until end of booking horizon
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Use apartment's booking horizon or default to end of 2026
  const bookingHorizonDate = apartment.bookingHorizon 
    ? new Date(apartment.bookingHorizon) 
    : new Date('2026-12-31')
  bookingHorizonDate.setHours(23, 59, 59, 999)
  
  // Calculate number of days to show
  const daysToShow = Math.min(
    Math.ceil((bookingHorizonDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
    730 // Maximum 2 years (730 days) for performance
  )
  
  const endDate = new Date(today)
  endDate.setDate(endDate.getDate() + daysToShow)
  
  // Format dates as strings for SQLite - use local dates
  const todayYear = today.getFullYear()
  const todayMonth = String(today.getMonth() + 1).padStart(2, '0')
  const todayDay = String(today.getDate()).padStart(2, '0')
  const todayStr = `${todayYear}-${todayMonth}-${todayDay}`
  
  const endYear = endDate.getFullYear()
  const endMonth = String(endDate.getMonth() + 1).padStart(2, '0')
  const endDay = String(endDate.getDate()).padStart(2, '0')
  const endDateStr = `${endYear}-${endMonth}-${endDay}`
  
  // Fetch all season prices that might apply
  const [seasonPrices, eventPrices] = await Promise.all([
    prisma.seasonPrice.findMany({
      where: {
        apartmentId: apartment.id,
        isActive: true,
        endDate: { gte: todayStr }  // Season ends after today
      },
      orderBy: { priority: 'desc' }
    }),
    prisma.eventPrice.findMany({
      where: {
        apartmentId: apartment.id,
        isActive: true,
        AND: [
          { startDate: { lte: endDateStr } },
          { endDate: { gte: todayStr } }
        ]
      }
    })
  ])
  
  const availabilitiesWithPrices = []
  
  for (let i = 0; i < daysToShow; i++) {
    const currentDate = new Date(today)
    currentDate.setDate(today.getDate() + i)
    
    // Format current date as local date string
    const year = currentDate.getFullYear()
    const month = String(currentDate.getMonth() + 1).padStart(2, '0')
    const day = String(currentDate.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    
    // Check if we have an existing availability record for this date
    const existingAvailability = apartment.availabilities.find(a => {
      const aDate = new Date(a.date)
      aDate.setHours(0, 0, 0, 0)
      return aDate.getTime() === currentDate.getTime()
    })
    
    // Calculate price based on seasons and events
    let calculatedPrice = apartment.price
    
    // Check for event price first (highest priority)
    // End date is EXCLUSIVE (like checkout date)
    const eventPrice = eventPrices.find(ep => 
      dateStr >= ep.startDate && dateStr < ep.endDate
    )
    if (eventPrice) {
      calculatedPrice = eventPrice.price
    } else {
      // Check for season price
      // End date is EXCLUSIVE (like checkout date)
      const seasonPrice = seasonPrices.find(sp => 
        dateStr >= sp.startDate && dateStr < sp.endDate
      )
      if (seasonPrice) {
        calculatedPrice = seasonPrice.price
      }
    }
    
    if (existingAvailability) {
      // Use existing availability with calculated price
      availabilitiesWithPrices.push({
        ...existingAvailability,
        priceOverride: existingAvailability.priceOverride || calculatedPrice
      })
    } else {
      // Create a new availability entry with calculated price
      availabilitiesWithPrices.push({
        date: currentDate,
        status: 'AVAILABLE',
        priceOverride: calculatedPrice
      })
    }
  }

  const averageRating = apartment.reviews.length > 0 
    ? apartment.reviews.reduce((sum, review) => sum + review.rating, 0) / apartment.reviews.length
    : null

  // Get current price for today
  const currentPrice = await getPriceForDate(apartment.id, today, apartment.price)
  
  // Find which season/event applies today
  const todayDateStr = todayStr
  const currentEvent = eventPrices.find(ep => 
    todayDateStr >= ep.startDate && todayDateStr < ep.endDate  // End date is EXCLUSIVE
  )
  const currentSeason = !currentEvent ? seasonPrices.find(sp => 
    todayDateStr >= sp.startDate && todayDateStr < sp.endDate  // End date is EXCLUSIVE
  ) : null
  
  const hasSeasonalPrice = currentPrice !== apartment.price
  const seasonName = currentEvent?.eventName || currentSeason?.name || null

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
                    <div>
                      {hasSeasonalPrice ? (
                        <>
                          <span className="text-3xl font-bold text-gray-900">
                            {formatPrice(currentPrice)}
                          </span>
                          <span className="text-lg text-gray-500 line-through ml-2">
                            {formatPrice(apartment.price)}
                          </span>
                        </>
                      ) : (
                        <span className="text-3xl font-bold">
                          {formatPrice(apartment.price)}
                        </span>
                      )}
                    </div>
                    <span className="text-gray-600">/ night</span>
                  </div>
                  {seasonName && (
                    <p className="text-sm text-blue-600 font-medium mt-1">
                      {seasonName} pricing
                    </p>
                  )}
                  {apartment.cleaningFee > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      + {formatPrice(apartment.cleaningFee)} cleaning fee
                    </p>
                  )}
                </div>

                <BookingForm 
                  apartment={apartment}
                  availabilities={availabilitiesWithPrices}
                  bookingHorizon={apartment.bookingHorizon || '2026-12-31'}
                />
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