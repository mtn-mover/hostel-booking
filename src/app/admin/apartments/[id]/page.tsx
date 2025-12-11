import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ApartmentWizard } from '@/components/admin/apartment-wizard'

interface Props {
  params: Promise<{
    id: string
  }>
}

export default async function AdminApartmentEdit({ params }: Props) {
  const resolvedParams = await params
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
        apartment={apartment}
        amenities={amenities}
        roomCategories={roomCategories}
      />
    </div>
  )
}