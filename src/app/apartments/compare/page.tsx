import { Suspense } from 'react'
import { ApartmentComparison } from '@/components/apartments/apartment-comparison'

export const dynamic = 'force-dynamic'

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Compare Apartments
          </h1>
          <p className="text-lg text-gray-600">
            Compare all available apartments side by side to find your perfect stay
          </p>
        </div>

        <Suspense fallback={<div className="text-center py-8">Loading comparison...</div>}>
          <ApartmentComparison />
        </Suspense>
      </div>
    </div>
  )
}