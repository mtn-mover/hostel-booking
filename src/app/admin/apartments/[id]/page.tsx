import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ApartmentWizard } from '@/components/admin/apartment-wizard'

interface Props {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    step?: string
  }>
}

export default async function AdminApartmentEdit({ params, searchParams }: Props) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const [apartment, amenities, roomCategories] = await Promise.all([
    prisma.apartment.findUnique({
      where: { id: resolvedParams.id },
      include: {
        apartmentImages: {
          orderBy: { order: 'asc' }
        },
        apartmentAmenities: {
          include: {
            amenity: true
          }
        }
      }
    }),
    prisma.amenity.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }]
    }),
    prisma.roomCategory.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    })
  ])

  if (!apartment) {
    notFound()
  }

  // Parse selectedRoomIds from JSON string (with fallback for missing column)
  let parsedRoomIds: string[] = []
  try {
    const rawSelectedRoomIds = (apartment as Record<string, unknown>).selectedRoomIds
    if (rawSelectedRoomIds && typeof rawSelectedRoomIds === 'string') {
      parsedRoomIds = JSON.parse(rawSelectedRoomIds)
    }
  } catch {
    // Column might not exist in database yet
    parsedRoomIds = []
  }

  const apartmentWithParsedRooms = {
    ...apartment,
    selectedRoomIds: parsedRoomIds
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/apartments"
          className="text-blue-600 hover:text-blue-800 mb-2 inline-block"
        >
          ← Zurück zur Übersicht
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Bearbeiten: {apartment.title || apartment.name || 'Apartment'}
        </h1>
      </div>

      {/* Wizard Form */}
      <ApartmentWizard
        mode="edit"
        apartment={apartmentWithParsedRooms}
        amenities={amenities}
        roomCategories={roomCategories}
        initialStep={resolvedSearchParams.step}
      />
    </div>
  )
}