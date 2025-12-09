'use client'

import { useEffect, useCallback } from 'react'
import { X, LucideIcon } from 'lucide-react'

interface AmenitiesModalProps {
  isOpen: boolean
  onClose: () => void
  groupedAmenities: Record<string, string[]>
  getIcon: (amenity: string) => LucideIcon
  isNotAvailable?: (amenity: string) => boolean
}

export function AmenitiesModal({
  isOpen,
  onClose,
  groupedAmenities,
  getIcon,
  isNotAvailable = () => false
}: AmenitiesModalProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  // Sort categories to show most important first (matching Airbnb order)
  const categoryOrder = [
    'Scenic Views',
    'Bathroom',
    'Bedroom & Laundry',
    'Entertainment',
    'Family',
    'Heating & Cooling',
    'Home Safety',
    'Internet & Office',
    'Kitchen & Dining',
    'Location Features',
    'Outdoor',
    'Parking & Access',
    'Services',
    'Not Included',
    'Other'
  ]

  const sortedCategories = Object.keys(groupedAmenities).sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a)
    const bIndex = categoryOrder.indexOf(b)
    if (aIndex === -1 && bIndex === -1) return 0
    if (aIndex === -1) return 1
    if (bIndex === -1) return -1
    return aIndex - bIndex
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl mx-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <button
            onClick={onClose}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold">
            What this place offers
          </h2>
          <div className="w-9" /> {/* Spacer for centering */}
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] px-6 py-4">
          {sortedCategories.map((category) => {
            const amenities = groupedAmenities[category]
            if (!amenities || amenities.length === 0) return null

            const isNotIncludedCategory = category === 'Not Included'

            return (
              <div key={category} className="mb-8 last:mb-4">
                <h3 className={`text-lg font-semibold mb-4 ${isNotIncludedCategory ? 'text-gray-500' : 'text-gray-900'}`}>
                  {category}
                </h3>
                <div className="space-y-4">
                  {amenities.map((amenity, index) => {
                    const Icon = getIcon(amenity)
                    const notAvailable = isNotAvailable(amenity) || isNotIncludedCategory
                    return (
                      <div
                        key={index}
                        className={`flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0 ${notAvailable ? 'opacity-60' : ''}`}
                      >
                        <Icon className={`w-6 h-6 flex-shrink-0 ${notAvailable ? 'text-gray-400' : 'text-gray-700'}`} />
                        <span className={notAvailable ? 'text-gray-400 line-through' : 'text-gray-700'}>
                          {amenity}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
