'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useState } from 'react'

function BookingSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const bookingId = searchParams.get('bookingId')
  const [isCancelling, setIsCancelling] = useState(false)
  const [isCancelled, setIsCancelled] = useState(false)

  const handleCancel = async () => {
    if (!bookingId) return
    if (!confirm('Möchten Sie diese Buchung wirklich stornieren?')) return

    setIsCancelling(true)
    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST'
      })

      if (response.ok) {
        setIsCancelled(true)
        setTimeout(() => {
          router.push('/')
        }, 2000)
      } else {
        alert('Fehler beim Stornieren der Buchung')
      }
    } catch (error) {
      console.error('Cancel error:', error)
      alert('Fehler beim Stornieren der Buchung')
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-md text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isCancelled ? 'Buchung storniert!' : 'Buchung bestätigt!'}
          </h1>
          <p className="text-gray-600">
            {isCancelled ? 'Ihre Buchung wurde erfolgreich storniert.' : 'Ihre Test-Buchung wurde erfolgreich erstellt.'}
          </p>
        </div>

        {bookingId && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Booking Reference:</p>
            <p className="text-lg font-mono font-semibold text-gray-900">{bookingId}</p>
          </div>
        )}

        <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-sm text-amber-800">
            ⚠️ This is a test booking. No payment was processed.
          </p>
        </div>

        <div className="space-y-3">
          {!isCancelled && (
            <>
              <button
                onClick={() => router.push('/admin/bookings')}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Im Admin Panel anzeigen
              </button>
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400 transition"
              >
                {isCancelling ? 'Storniere...' : 'Buchung stornieren'}
              </button>
            </>
          )}
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Zurück zur Startseite
          </button>
        </div>
      </div>
    </div>
  )
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="availability-loading"></div>
      </div>
    }>
      <BookingSuccessContent />
    </Suspense>
  )
}