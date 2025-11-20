import { Suspense } from 'react'
import { ApartmentGrid } from '@/components/apartments/apartment-grid'
import { SearchFiltersEnhanced } from '@/components/search/search-filters-enhanced'
import { HeroSimple } from '@/components/layout/hero-simple'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSimple />
      
      <main className="container mx-auto px-4 py-8">
        <div id="apartments" className="mb-8 scroll-mt-20">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Find Your Perfect Stay
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Discover comfortable apartments in the heart of Switzerland
          </p>
          
          <SearchFiltersEnhanced />
        </div>

        <Suspense fallback={<div className="text-center py-8">Loading apartments...</div>}>
          <ApartmentGrid />
        </Suspense>
      </main>
    </div>
  )
}