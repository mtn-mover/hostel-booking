import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ApartmentWizard } from '@/components/admin/apartment-wizard'

export default async function NewApartmentPage() {
  const [amenities, roomCategories] = await Promise.all([
    prisma.amenity.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }]
    }),
    prisma.roomCategory.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    })
  ])

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
          Neues Apartment erstellen
        </h1>
        <p className="mt-2 text-gray-600">
          Folgen Sie den Schritten um ein neues Apartment anzulegen
        </p>
      </div>

      {/* Wizard Form */}
      <ApartmentWizard
        mode="create"
        amenities={amenities}
        roomCategories={roomCategories}
      />
    </div>
  )
}
