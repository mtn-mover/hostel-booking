'use client'

import { useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import { ImageLightbox } from './ImageLightbox'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

interface ImageGalleryProps {
  images: { url: string; alt?: string; roomName?: string }[]
  apartmentName: string
}

export function ImageGallery({ images, apartmentName }: ImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[4/3] bg-gray-200 rounded-xl flex items-center justify-center">
        <span className="text-gray-400">No images available</span>
      </div>
    )
  }

  // Desktop: Airbnb-style grid layout
  const DesktopGallery = () => {
    const mainImage = images[0]
    const gridImages = images.slice(1, 5)

    return (
      <div className="hidden md:block relative">
        <div className="flex gap-2 h-[400px] lg:h-[500px] rounded-xl overflow-hidden">
          {/* Main large image - 50% width on left */}
          <div
            className="w-1/2 relative cursor-pointer group"
            onClick={() => openLightbox(0)}
          >
            <img
              src={mainImage.url}
              alt={mainImage.alt || apartmentName}
              className="w-full h-full object-cover group-hover:brightness-95 transition-all duration-200"
            />
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
          </div>

          {/* Right side - 2x2 grid of smaller images (50% width total) */}
          <div className="w-1/2 grid grid-cols-2 grid-rows-2 gap-2">
            {gridImages.map((image, index) => (
              <div
                key={index}
                className="relative cursor-pointer group overflow-hidden"
                onClick={() => openLightbox(index + 1)}
              >
                <img
                  src={image.url}
                  alt={image.alt || `${apartmentName} - Photo ${index + 2}`}
                  className="w-full h-full object-cover group-hover:brightness-95 transition-all duration-200"
                />
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
              </div>
            ))}

            {/* Fill remaining slots if less than 4 grid images */}
            {Array.from({ length: Math.max(0, 4 - gridImages.length) }).map((_, index) => (
              <div key={`empty-${index}`} className="bg-gray-100" />
            ))}
          </div>
        </div>

        {/* Show all photos button - Airbnb style */}
        {images.length > 1 && (
          <button
            onClick={() => openLightbox(0)}
            className="absolute bottom-4 right-4 bg-white border border-gray-900 px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Show all photos
          </button>
        )}
      </div>
    )
  }

  // Mobile: Swipeable carousel
  const MobileGallery = () => (
    <div className="md:hidden">
      <Swiper
        modules={[Navigation, Pagination]}
        pagination={{ clickable: true }}
        spaceBetween={0}
        slidesPerView={1}
        className="rounded-xl aspect-[4/3]"
      >
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <div
              className="w-full h-full cursor-pointer"
              onClick={() => openLightbox(index)}
            >
              <img
                src={image.url}
                alt={image.alt || `${apartmentName} - Photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )

  return (
    <div className="relative">
      <DesktopGallery />
      <MobileGallery />

      <ImageLightbox
        images={images}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  )
}
