import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatPrice, formatDate } from '@/lib/utils'

interface ConfirmationPageProps {
  searchParams: Promise<{ bookingId?: string }>
}

export default async function BookingConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const { bookingId } = await searchParams

  if (!bookingId) {
    notFound()
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      apartment: {
        include: {
          images: {
            where: { isMain: true },
            take: 1
          }
        }
      }
    }
  })

  if (!booking) {
    notFound()
  }

  const nights = Math.ceil((booking.checkOut.getTime() - booking.checkIn.getTime()) / (1000 * 60 * 60 * 24))
  const isConfirmed = booking.status === 'CONFIRMED' && booking.paymentStatus === 'PAID'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            {isConfirmed ? (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            ) : (
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
            )}
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isConfirmed ? 'Booking Confirmed!' : 'Booking Pending'}
            </h1>
            
            <p className="text-lg text-gray-600">
              {isConfirmed 
                ? 'Your reservation has been confirmed and you will receive a confirmation email shortly.'
                : 'Your booking is being processed. You will receive confirmation once payment is complete.'
              }
            </p>
          </div>

          {/* Booking Details Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Apartment Info */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{booking.apartment.name}</h3>
                  {booking.apartment.images[0] && (
                    <img 
                      src={booking.apartment.images[0].url}
                      alt={booking.apartment.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                </div>

                {/* Booking Info */}
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">Booking ID</span>
                    <p className="font-medium">{booking.id}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-sm text-gray-600">Check-in</span>
                      <p className="font-medium">{formatDate(booking.checkIn)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Check-out</span>
                      <p className="font-medium">{formatDate(booking.checkOut)}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-sm text-gray-600">Guests</span>
                      <p className="font-medium">{booking.guests}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Nights</span>
                      <p className="font-medium">{nights}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-gray-600">Total Paid</span>
                    <p className="text-lg font-bold text-green-600">{formatPrice(booking.totalPrice)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Banner */}
            <div className={`p-4 ${isConfirmed ? 'bg-green-50' : 'bg-yellow-50'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isConfirmed 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.status}
                  </span>
                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    booking.paymentStatus === 'PAID'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    Payment {booking.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Guest Information */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Guest Information</h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Name</span>
                <p className="font-medium">{booking.guestName}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Email</span>
                <p className="font-medium">{booking.guestEmail}</p>
              </div>
              {booking.guestPhone && (
                <div>
                  <span className="text-sm text-gray-600">Phone</span>
                  <p className="font-medium">{booking.guestPhone}</p>
                </div>
              )}
              {booking.specialRequests && (
                <div>
                  <span className="text-sm text-gray-600">Special Requests</span>
                  <p className="font-medium">{booking.specialRequests}</p>
                </div>
              )}
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3">Important Information</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Check-in time: 3:00 PM - 8:00 PM</li>
              <li>• Check-out time: 11:00 AM</li>
              <li>• Please bring a valid ID for check-in</li>
              <li>• Contact us via WhatsApp for any special arrangements</li>
              <li>• Free cancellation up to 24 hours before check-in</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/"
              className="flex-1 bg-blue-600 text-white text-center py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Back to Home
            </Link>
            
            <Link
              href={`/apartments/${booking.apartmentId}`}
              className="flex-1 bg-gray-200 text-gray-800 text-center py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              View Apartment
            </Link>
          </div>

          {/* Contact Information */}
          <div className="text-center mt-8 text-gray-600">
            <p className="mb-2">Need help with your booking?</p>
            <a 
              href="https://wa.me/41798016570" 
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Contact us on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}