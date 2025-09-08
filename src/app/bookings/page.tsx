import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatPrice, formatDate } from '@/lib/utils'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function MyBookingsPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/signin?callbackUrl=/bookings')
  }

  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    include: {
      apartment: {
        include: {
          images: {
            where: { isMain: true },
            take: 1
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
            <p className="mt-2 text-gray-600">View and manage your apartment bookings</p>
          </div>

          {bookings.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-600 mb-6">Start exploring our apartments and make your first booking!</p>
              <Link
                href="/apartments"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Browse Apartments
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Apartment Image */}
                      <div className="md:w-48">
                        {booking.apartment.images[0] && (
                          <img
                            src={booking.apartment.images[0].url}
                            alt={booking.apartment.name}
                            className="w-full h-32 md:h-24 object-cover rounded-lg"
                          />
                        )}
                      </div>

                      {/* Booking Details */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              {booking.apartment.name}
                            </h3>
                            <p className="text-gray-600">
                              Booking ID: #{booking.id.substring(0, 8)}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="space-y-2">
                              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                                booking.status === 'CONFIRMED'
                                  ? 'bg-green-100 text-green-800'
                                  : booking.status === 'PENDING'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {booking.status}
                              </span>
                              <div>
                                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                                  booking.paymentStatus === 'PAID'
                                    ? 'bg-green-100 text-green-800'
                                    : booking.paymentStatus === 'PENDING'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  Payment {booking.paymentStatus}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <span className="text-sm text-gray-600">Check-in</span>
                            <p className="font-medium">{formatDate(booking.checkIn)}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Check-out</span>
                            <p className="font-medium">{formatDate(booking.checkOut)}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Guests</span>
                            <p className="font-medium">{booking.guests}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Total</span>
                            <p className="font-bold text-green-600">{formatPrice(booking.totalPrice)}</p>
                          </div>
                        </div>

                        {booking.specialRequests && (
                          <div className="mb-4">
                            <span className="text-sm text-gray-600">Special Requests</span>
                            <p className="text-sm text-gray-900">{booking.specialRequests}</p>
                          </div>
                        )}

                        <div className="flex gap-3">
                          <Link
                            href={`/booking/confirmation?bookingId=${booking.id}`}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                          >
                            View Details
                          </Link>
                          <Link
                            href={`/apartments/${booking.apartmentId}`}
                            className="text-gray-600 hover:text-gray-700 text-sm"
                          >
                            View Apartment
                          </Link>
                          {booking.status === 'CONFIRMED' && new Date(booking.checkOut) < new Date() && (
                            <Link
                              href={`/review/${booking.id}`}
                              className="text-green-600 hover:text-green-700 font-medium text-sm"
                            >
                              Write Review
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-6 py-3 text-sm text-gray-600">
                    Booked on {booking.createdAt.toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}