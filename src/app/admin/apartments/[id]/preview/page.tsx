import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { ImageGallery } from '@/components/apartment/ImageGallery'
import { AmenitiesSection } from '@/components/apartment/AmenitiesSection'
import { WhereYoullSleep } from '@/components/apartment/WhereYoullSleep'
import { Eye, EyeOff, ArrowLeft, Edit } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminApartmentPreview({ params }: Props) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/auth/signin')
  }

  const { id } = await params

  // Fetch apartment WITHOUT isActive filter (admin can see all)
  const apartment = await prisma.apartment.findUnique({
    where: { id },
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
      bedroomDetails: {
        orderBy: { order: 'asc' }
      }
    }
  })

  if (!apartment) {
    notFound()
  }

  // Parse amenities
  const amenities = apartment.apartmentAmenities.length > 0
    ? apartment.apartmentAmenities.map(aa => aa.amenity.name)
    : JSON.parse(apartment.amenities || '[]')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Preview Banner */}
      <div className={`sticky top-0 z-50 ${apartment.isActive ? 'bg-green-600' : 'bg-amber-500'} text-white px-4 py-3 shadow-md`}>
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/admin/apartments/${id}`}
              className="flex items-center gap-2 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Zurück zum Bearbeiten
            </Link>
            <div className="h-6 w-px bg-white/30" />
            <div className="flex items-center gap-2">
              {apartment.isActive ? (
                <>
                  <Eye className="w-4 h-4" />
                  <span className="font-medium">Aktiv - Öffentlich sichtbar</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4" />
                  <span className="font-medium">Inaktiv - Nur Admin-Vorschau</span>
                </>
              )}
            </div>
          </div>
          <Link
            href={`/admin/apartments/${id}`}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
            Bearbeiten
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
            {apartment.title || apartment.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <span>
              {apartment.city}, {apartment.country}
            </span>
          </div>
        </div>

        {/* Image Gallery */}
        {apartment.apartmentImages.length > 0 ? (
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
        ) : (
          <div className="mb-8 bg-gray-100 rounded-xl p-12 text-center">
            <div className="text-gray-400 mb-2">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">Keine Bilder vorhanden</p>
            <Link
              href={`/admin/apartments/${id}`}
              className="inline-block mt-4 text-blue-600 hover:text-blue-700"
            >
              Bilder hochladen →
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-semibold mb-4">About this place</h2>
              <p className="text-gray-700 whitespace-pre-line">
                {apartment.description || <span className="text-gray-400 italic">Keine Beschreibung</span>}
              </p>

              {apartment.theSpace && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold mb-2">The space</h3>
                  <p className="text-gray-700 whitespace-pre-line">
                    {apartment.theSpace}
                  </p>
                </div>
              )}

              {apartment.guestAccess && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold mb-2">Guest access</h3>
                  <p className="text-gray-700 whitespace-pre-line">
                    {apartment.guestAccess}
                  </p>
                </div>
              )}

              {apartment.otherNotes && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold mb-2">Other things to note</h3>
                  <p className="text-gray-700 whitespace-pre-line">
                    {apartment.otherNotes}
                  </p>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-semibold mb-4">Features</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-2">👥</span>
                  <div>
                    <div className="font-medium">{apartment.maxGuests} Guests</div>
                    <div className="text-sm text-gray-600">Maximum</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl mr-2">🚪</span>
                  <div>
                    <div className="font-medium">{apartment.bedrooms} Bedroom{apartment.bedrooms !== 1 ? 's' : ''}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl mr-2">🛏️</span>
                  <div>
                    <div className="font-medium">{apartment.beds} Bed{apartment.beds !== 1 ? 's' : ''}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl mr-2">🚿</span>
                  <div>
                    <div className="font-medium">{apartment.bathrooms} Bathroom{apartment.bathrooms !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Where you'll sleep */}
            {apartment.bedroomDetails.length > 0 && (
              <WhereYoullSleep bedrooms={apartment.bedroomDetails} />
            )}

            {/* Amenities */}
            {amenities.length > 0 ? (
              <AmenitiesSection amenities={amenities} />
            ) : (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
                <p className="text-gray-400 italic">Keine Ausstattungsmerkmale ausgewählt</p>
              </div>
            )}
          </div>

          {/* Right Column - Booking Info */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Book on Airbnb
                </h3>

                {apartment.airbnbUrl ? (
                  <a
                    href={apartment.airbnbUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white text-center py-4 px-6 rounded-lg font-semibold text-lg hover:from-rose-600 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
                  >
                    Airbnb
                  </a>
                ) : (
                  <div className="bg-gray-100 text-gray-500 text-center py-4 px-6 rounded-lg">
                    Keine Airbnb-URL hinterlegt
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📍</span>
                    <div>
                      <h4 className="font-medium text-gray-900">Location</h4>
                      <p className="text-gray-600">
                        {apartment.address && <>{apartment.address}<br /></>}
                        {apartment.city}, {apartment.country}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
