import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { RoomImageManager } from '@/components/admin/room-image-manager'
import { ArrowLeft, Settings } from 'lucide-react'

interface Props {
  params: Promise<{
    id: string
  }>
}

export default async function ApartmentImagesPage({ params }: Props) {
  const { id } = await params

  const [apartment, roomCategories] = await Promise.all([
    prisma.apartment.findUnique({
      where: { id },
      include: {
        apartmentImages: {
          orderBy: { order: 'asc' }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/apartments"
            className="text-blue-600 hover:text-blue-800 mb-2 inline-flex items-center text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Zurück zur Übersicht
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Bilder: {apartment.title || apartment.name || 'Apartment'}
          </h1>
          <p className="text-gray-600 mt-1">
            Laden Sie Bilder für jeden Raum hoch und fügen Sie Beschreibungen hinzu.
          </p>
        </div>

        <Link
          href={`/admin/apartments/${id}`}
          className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Settings className="w-4 h-4 mr-2" />
          Apartment bearbeiten
        </Link>
      </div>

      {/* Apartment Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">{apartment.title || apartment.name}</h2>
            <p className="text-sm text-gray-500">
              {apartment.city}, {apartment.country} · {apartment.maxGuests} Gäste · {apartment.bedrooms} Schlafzimmer · {apartment.bathrooms} Bad
            </p>
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              apartment.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {apartment.isActive ? 'Aktiv' : 'Inaktiv'}
            </span>
            <p className="text-sm text-gray-500 mt-1">
              {apartment.apartmentImages.length} Bilder
            </p>
          </div>
        </div>
      </div>

      {/* Room Image Manager */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <RoomImageManager
          apartmentId={apartment.id}
          existingImages={apartment.apartmentImages}
          roomCategories={roomCategories}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <Link
          href="/admin/apartments"
          className="text-gray-600 hover:text-gray-800"
        >
          Zurück zur Übersicht
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href={`/admin/apartments/${id}`}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Apartment bearbeiten
          </Link>
          <Link
            href={`/apartments/${id}`}
            target="_blank"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Vorschau anzeigen
          </Link>
        </div>
      </div>
    </div>
  )
}
