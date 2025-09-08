'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Grid3x3, X, ChevronLeft, ChevronRight, Camera } from 'lucide-react'

interface RoomCategory {
  id: string
  name: string
  nameEn: string
  nameDe: string
  order: number
  icon?: string
}

interface ApartmentImage {
  id: string
  url: string
  alt?: string
  roomId?: string
  order: number
}

interface Props {
  images: ApartmentImage[]
  roomCategories: RoomCategory[]
  apartmentName: string
}

export function EnhancedHeroGallery({ images, roomCategories, apartmentName }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)

  // Group images by room
  const imagesByRoom = roomCategories.reduce((acc, room) => {
    const roomImages = images.filter(img => img.roomId === room.id)
    if (roomImages.length > 0) {
      acc[room.id] = roomImages.sort((a, b) => a.order - b.order)
    }
    return acc
  }, {} as Record<string, ApartmentImage[]>)

  // Get all images or filtered by room
  const displayImages = selectedRoomId 
    ? imagesByRoom[selectedRoomId] || []
    : images.sort((a, b) => a.order - b.order)

  // Get main display images (first 5)
  const heroImages = images.slice(0, 5)

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showModal])

  const navigateImage = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentImageIndex(prev => 
        prev > 0 ? prev - 1 : displayImages.length - 1
      )
    } else {
      setCurrentImageIndex(prev => 
        prev < displayImages.length - 1 ? prev + 1 : 0
      )
    }
  }

  // Get room name for an image
  const getRoomName = (roomId?: string) => {
    if (!roomId) return 'Allgemein'
    const room = roomCategories.find(r => r.id === roomId)
    return room?.nameDe || 'Weitere Bilder'
  }

  if (images.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
        <Camera className="w-12 h-12 text-gray-400" />
      </div>
    )
  }

  // Airbnb-style grid layout
  return (
    <>
      {/* Hero Gallery Grid */}
      <div className="relative rounded-xl overflow-hidden">
        {heroImages.length === 1 ? (
          // Single image layout
          <div 
            className="relative h-[400px] md:h-[500px] cursor-pointer"
            onClick={() => {
              setCurrentImageIndex(0)
              setShowModal(true)
            }}
          >
            <Image
              src={heroImages[0].url}
              alt={heroImages[0].alt || apartmentName}
              fill
              className="object-cover"
              priority
            />
          </div>
        ) : heroImages.length === 2 ? (
          // Two images layout
          <div className="grid grid-cols-2 gap-2 h-[400px] md:h-[500px]">
            {heroImages.map((img, idx) => (
              <div 
                key={img.id}
                className="relative cursor-pointer hover:opacity-95 transition"
                onClick={() => {
                  setCurrentImageIndex(idx)
                  setShowModal(true)
                }}
              >
                <Image
                  src={img.url}
                  alt={img.alt || `${apartmentName} ${idx + 1}`}
                  fill
                  className="object-cover"
                  priority={idx === 0}
                />
              </div>
            ))}
          </div>
        ) : (
          // 3+ images: Airbnb-style grid
          <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[400px] md:h-[500px]">
            {/* Main large image on the left */}
            <div 
              className="col-span-2 row-span-2 relative cursor-pointer hover:opacity-95 transition"
              onClick={() => {
                setCurrentImageIndex(0)
                setShowModal(true)
              }}
            >
              <Image
                src={heroImages[0].url}
                alt={heroImages[0].alt || apartmentName}
                fill
                className="object-cover"
                priority
              />
            </div>
            
            {/* Four smaller images on the right */}
            {heroImages.slice(1, 5).map((img, idx) => (
              <div 
                key={img.id}
                className="relative cursor-pointer hover:opacity-95 transition"
                onClick={() => {
                  setCurrentImageIndex(idx + 1)
                  setShowModal(true)
                }}
              >
                <Image
                  src={img.url}
                  alt={img.alt || `${apartmentName} ${idx + 2}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* Show all photos button */}
        <button
          onClick={() => {
            setCurrentImageIndex(0)
            setShowModal(true)
          }}
          className="absolute bottom-4 right-4 bg-white hover:bg-gray-100 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition"
        >
          <Grid3x3 className="w-4 h-4" />
          <span className="text-sm font-medium">Alle {images.length} Fotos anzeigen</span>
        </button>
      </div>

      {/* Full Gallery Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4 z-10">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <p className="text-sm opacity-90">{getRoomName(displayImages[currentImageIndex]?.roomId)}</p>
                <p className="font-medium">{currentImageIndex + 1} / {displayImages.length}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white/20 rounded-full transition"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          {/* Room Filter Tabs */}
          <div className="absolute top-16 left-0 right-0 px-4 z-10">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => {
                  setSelectedRoomId(null)
                  setCurrentImageIndex(0)
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
                  !selectedRoomId
                    ? 'bg-white text-black'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                Alle Fotos ({images.length})
              </button>
              {Object.entries(imagesByRoom).map(([roomId, roomImages]) => {
                const room = roomCategories.find(r => r.id === roomId)
                return (
                  <button
                    key={roomId}
                    onClick={() => {
                      setSelectedRoomId(roomId)
                      setCurrentImageIndex(0)
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
                      selectedRoomId === roomId
                        ? 'bg-white text-black'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {room?.nameDe} ({roomImages.length})
                  </button>
                )
              })}
            </div>
          </div>

          {/* Main Image Display */}
          <div className="h-full flex items-center justify-center px-16 py-24">
            {/* Navigation Arrows */}
            <button
              onClick={() => navigateImage('prev')}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 rounded-full transition"
            >
              <ChevronLeft className="w-8 h-8 text-white" />
            </button>
            
            <button
              onClick={() => navigateImage('next')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 rounded-full transition"
            >
              <ChevronRight className="w-8 h-8 text-white" />
            </button>

            {/* Image */}
            <div className="relative w-full h-full max-w-6xl">
              {displayImages[currentImageIndex] && (
                <Image
                  src={displayImages[currentImageIndex].url}
                  alt={displayImages[currentImageIndex].alt || apartmentName}
                  fill
                  className="object-contain"
                />
              )}
            </div>
          </div>

          {/* Thumbnail Strip */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <div className="flex gap-2 justify-center overflow-x-auto max-w-4xl mx-auto">
              {displayImages.slice(
                Math.max(0, currentImageIndex - 5),
                Math.min(displayImages.length, currentImageIndex + 6)
              ).map((img, idx) => {
                const actualIndex = Math.max(0, currentImageIndex - 5) + idx
                return (
                  <button
                    key={img.id}
                    onClick={() => setCurrentImageIndex(actualIndex)}
                    className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden transition ${
                      actualIndex === currentImageIndex
                        ? 'ring-2 ring-white'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt=""
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}