import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'

export default async function AdminApartments() {
  const apartments = await prisma.apartment.findMany({
    include: {
      apartmentImages: {
        where: { isMain: true },
        take: 1
      },
      _count: {
        select: {
          bookings: true,
          reviews: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Apartments</h1>
          <p className="mt-2 text-gray-600">Manage your apartment listings</p>
        </div>
        <Link
          href="/admin/apartments/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Add New Apartment
        </Link>
      </div>

      {/* Apartments Grid */}
      <div className="bg-white rounded-lg shadow">
        {apartments.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">No apartments yet</p>
            <Link
              href="/admin/apartments/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Add Your First Apartment
            </Link>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apartments.map((apartment) => (
                <div key={apartment.id} className="border rounded-lg overflow-hidden">
                  {apartment.apartmentImages[0] && (
                    <img
                      src={apartment.apartmentImages[0].url}
                      alt={apartment.title || apartment.name || 'Apartment'}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {apartment.title || apartment.name || 'Apartment'}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full font-medium ${
                        apartment.isActive 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {apartment.isActive ? (
                          <>
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                            Active
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1"></span>
                            Inactive
                          </>
                        )}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {apartment.shortDescription || apartment.description}
                    </p>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Max Guests:</span>
                        <span>{apartment.maxGuests}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Price/Night:</span>
                        <span className="font-semibold">{formatPrice(apartment.price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bookings:</span>
                        <span>{apartment._count.bookings}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reviews:</span>
                        <span>{apartment._count.reviews}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Link
                        href={`/admin/apartments/${apartment.id}`}
                        className="flex-1 bg-blue-600 text-white text-center py-2 px-3 rounded text-sm hover:bg-blue-700 transition"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/apartments/${apartment.id}`}
                        className="flex-1 bg-gray-200 text-gray-800 text-center py-2 px-3 rounded text-sm hover:bg-gray-300 transition"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}