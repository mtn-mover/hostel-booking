'use client'

import { useEffect, useCallback, useState, useMemo } from 'react'

interface ImageLightboxProps {
  images: { url: string; alt?: string; roomName?: string }[]
  initialIndex: number
  isOpen: boolean
  onClose: () => void
}

interface ImageSection {
  title: string
  images: { url: string; alt?: string; roomName?: string; originalIndex: number }[]
}

export function ImageLightbox({ images, initialIndex, isOpen, onClose }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  // Group images by room/section
  const sections = useMemo(() => {
    const grouped: ImageSection[] = []
    let currentSection: ImageSection | null = null

    images.forEach((image, index) => {
      const roomName = image.roomName || 'General'

      if (!currentSection || currentSection.title !== roomName) {
        currentSection = {
          title: roomName,
          images: []
        }
        grouped.push(currentSection)
      }

      currentSection.images.push({
        ...image,
        originalIndex: index
      })
    })

    return grouped
  }, [images])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
      setCurrentIndex(initialIndex)
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, handleKeyDown, initialIndex])

  // Scroll to the initial image when opening
  useEffect(() => {
    if (isOpen && initialIndex > 0) {
      const element = document.getElementById(`photo-${initialIndex}`)
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'auto', block: 'start' })
        }, 100)
      }
    }
  }, [isOpen, initialIndex])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-white">
      {/* Header - Fixed */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-2 -ml-3 hover:bg-gray-100 rounded-lg transition-colors text-gray-900"
            aria-label="Close gallery"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="font-medium">Close</span>
          </button>
          <div className="text-sm text-gray-600">
            {images.length} photos
          </div>
        </div>
      </div>

      {/* Scrollable Photo Gallery */}
      <div className="h-full overflow-y-auto pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-12">
              {/* Section Title - Airbnb style */}
              <div className="mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {section.title}
                </h2>
              </div>

              {/* Section Images */}
              <div className="space-y-6">
                {section.images.map((image, imageIndex) => (
                  <div
                    key={imageIndex}
                    id={`photo-${image.originalIndex}`}
                    className="scroll-mt-24"
                  >
                    <div className="relative rounded-xl overflow-hidden bg-gray-100">
                      <img
                        src={image.url}
                        alt={image.alt || `${section.title} - Photo ${imageIndex + 1}`}
                        className="w-full h-auto object-contain"
                        loading={image.originalIndex < 3 ? 'eager' : 'lazy'}
                      />
                    </div>
                    {image.alt && (
                      <p className="mt-3 text-sm text-gray-600">{image.alt}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Photo counter - Fixed at bottom */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900/80 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
        {images.length} photos
      </div>
    </div>
  )
}
