import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ApartmentEditFormTabbed } from '@/components/admin/apartment-edit-form-tabbed'

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
        },
        bookings: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        },
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: true
          }
        }
      }
    }),
    prisma.amenity.findMany({
      orderBy: { name: 'asc' }
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
      <div className="flex justify-between items-center">
        <div>
          <Link 
            href="/admin/apartments"
            className="text-blue-600 hover:text-blue-800 mb-2 inline-block"
          >
            ← Back to Apartments
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit: {apartment.title || apartment.name || 'Apartment'}
          </h1>
        </div>
      </div>

      {/* Edit Form */}
      <ApartmentEditFormTabbed
        apartment={apartment}
        amenities={amenities}
        roomCategories={roomCategories}
      />
    </div>
  )
}