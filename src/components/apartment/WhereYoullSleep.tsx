'use client'

import { useRef } from 'react'

interface Bedroom {
  id: string
  name: string
  beds: string
  imageUrl?: string | null
}

interface WhereYoullSleepProps {
  bedrooms: Bedroom[]
}

export function WhereYoullSleep({ bedrooms }: WhereYoullSleepProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  if (!bedrooms || bedrooms.length === 0) {
    return null
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-2xl font-semibold mb-6">Where you'll sleep</h2>

      <div className="relative">
        {/* Scroll buttons for multiple bedrooms */}
        {bedrooms.length > 2 && (
          <>
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-8 h-8 bg-white border border-gray-300 rounded-full shadow-md flex items-center justify-center hover:shadow-lg transition-shadow"
              aria-label="Scroll left"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-8 h-8 bg-white border border-gray-300 rounded-full shadow-md flex items-center justify-center hover:shadow-lg transition-shadow"
              aria-label="Scroll right"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Bedroom cards container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {bedrooms.map((bedroom) => (
            <div
              key={bedroom.id}
              className="flex-shrink-0 w-[200px] border border-gray-200 rounded-xl overflow-hidden"
            >
              {/* Bedroom image or placeholder */}
              <div className="h-32 bg-gray-100 flex items-center justify-center">
                {bedroom.imageUrl ? (
                  <img
                    src={bedroom.imageUrl}
                    alt={bedroom.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                )}
              </div>

              {/* Bedroom info */}
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-1">{bedroom.name}</h3>
                <p className="text-sm text-gray-600">{bedroom.beds}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
