'use client'

import { useEffect, useCallback } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Keyboard, Thumbs } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/thumbs'

interface ImageLightboxProps {
  images: { url: string; alt?: string }[]
  initialIndex: number
  isOpen: boolean
  onClose: () => void
}

export function ImageLightbox({ images, initialIndex, isOpen, onClose }: ImageLightboxProps) {
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

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <div className="text-sm font-medium">
          {images.length} photos
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
          aria-label="Close lightbox"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Main Swiper */}
      <div className="flex-1 flex items-center justify-center px-4 pb-4">
        <Swiper
          modules={[Navigation, Keyboard]}
          navigation
          keyboard={{ enabled: true }}
          initialSlide={initialIndex}
          spaceBetween={20}
          className="w-full h-full lightbox-swiper"
          style={{ '--swiper-navigation-color': '#fff' } as React.CSSProperties}
        >
          {images.map((image, index) => (
            <SwiperSlide key={index} className="flex items-center justify-center">
              <img
                src={image.url}
                alt={image.alt || `Photo ${index + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Thumbnail Strip */}
      <div className="p-4 bg-black/50">
        <div className="flex gap-2 overflow-x-auto justify-center">
          {images.map((image, index) => (
            <button
              key={index}
              className="flex-shrink-0 w-16 h-12 rounded overflow-hidden opacity-60 hover:opacity-100 transition-opacity focus:opacity-100 focus:ring-2 focus:ring-white"
            >
              <img
                src={image.url}
                alt={image.alt || `Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
