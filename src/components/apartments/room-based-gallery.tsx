'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react'

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

export function RoomBasedGallery({ images, roomCategories, apartmentName }: Props) {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

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

  // Group images by room
  const imagesByRoom = roomCategories.reduce((acc, room) => {
    const roomImages = images.filter(img => img.roomId === room.id)
    if (roomImages.length > 0) {
      acc[room.id] = roomImages.sort((a, b) => a.order - b.order)
    }
    return acc
  }, {} as Record<string, ApartmentImage[]>)

  // Get rooms with images
  const visibleRooms = roomCategories.filter(room => imagesByRoom[room.id]?.length > 0)
  
  // Get first image for main display
  const mainImage = images.length > 0 ? images[0] : null

  // Get images for selected room
  const selectedRoomImages = selectedRoom ? imagesByRoom[selectedRoom] : []
  const selectedRoomData = visibleRooms.find(r => r.id === selectedRoom)

  const openRoomGallery = (roomId: string) => {
    setSelectedRoom(roomId)
    setSelectedImageIndex(0)
    setShowModal(true)
  }

  const navigateImage = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1)
    } else if (direction === 'next' && selectedImageIndex < selectedRoomImages.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1)
    }
  }

  // Create collage layout for modal
  const createCollageLayout = (images: ApartmentImage[]) => {
    const count = images.length
    
    if (count === 1) {
      return (
        <div className="relative h-full">
          <Image
            src={images[0].url}
            alt={images[0].alt || selectedRoomData?.nameDe || ''}
            fill
            className="object-contain"
          />
        </div>
      )
    }
    
    if (count === 2) {
      return (
        <div className="grid grid-cols-2 gap-2 h-full">
          {images.map((img, idx) => (
            <div key={img.id} className="relative">
              <Image
                src={img.url}
                alt={img.alt || `${selectedRoomData?.nameDe} ${idx + 1}`}
                fill
                className="object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      )
    }
    
    if (count === 3) {
      return (
        <div className="grid grid-cols-2 gap-2 h-full">
          <div className="relative col-span-1 row-span-2">
            <Image
              src={images[0].url}
              alt={images[0].alt || selectedRoomData?.nameDe || ''}
              fill
              className="object-cover rounded-lg"
            />
          </div>
          <div className="col-span-1 grid grid-rows-2 gap-2">
            {images.slice(1).map((img, idx) => (
              <div key={img.id} className="relative">
                <Image
                  src={img.url}
                  alt={img.alt || `${selectedRoomData?.nameDe} ${idx + 2}`}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>
      )
    }
    
    if (count === 4) {
      return (
        <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full">
          {images.map((img, idx) => (
            <div key={img.id} className="relative">
              <Image
                src={img.url}
                alt={img.alt || `${selectedRoomData?.nameDe} ${idx + 1}`}
                fill
                className="object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      )
    }
    
    // 5+ images - Gallery with navigation
    return (
      <div className="relative h-full">
        <div className="relative h-full">
          <Image
            src={images[selectedImageIndex].url}
            alt={images[selectedImageIndex].alt || selectedRoomData?.nameDe || ''}
            fill
            className="object-contain"
          />
        </div>
        
        {/* Navigation for many images */}
        {selectedImageIndex > 0 && (
          <button
            onClick={() => navigateImage('prev')}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        
        {selectedImageIndex < images.length - 1 && (
          <button
            onClick={() => navigateImage('next')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
        
        {/* Image counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
          {selectedImageIndex + 1} / {images.length}
        </div>
        
        {/* Thumbnail strip for 5+ images */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50">
          <div className="flex gap-2 justify-center overflow-x-auto">
            {images.slice(0, 8).map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setSelectedImageIndex(idx)}
                className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden transition ${
                  idx === selectedImageIndex
                    ? 'ring-2 ring-white opacity-100'
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
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!mainImage) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center h-96">
        <Camera className="w-12 h-12 text-gray-400" />
      </div>
    )
  }

  return (
    <>
      {/* Main Image - Half width, not too tall */}
      <div className="mb-6">
        <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden bg-gray-100">
          <Image
            src={mainImage.url}
            alt={mainImage.alt || apartmentName}
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Room Thumbnails */}
      {visibleRooms.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Räume</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {visibleRooms.map(room => {
              const roomImages = imagesByRoom[room.id]
              const firstImage = roomImages[0]
              
              return (
                <button
                  key={room.id}
                  onClick={() => openRoomGallery(room.id)}
                  className="group text-left"
                >
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 mb-2">
                    <Image
                      src={firstImage.url}
                      alt={room.nameDe}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    {roomImages.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs font-medium">
                        {roomImages.length} Fotos
                      </div>
                    )}
                  </div>
                  <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                    {room.nameDe}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Room Gallery Modal */}
      {showModal && selectedRoomImages.length > 0 && selectedRoomData && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedRoomData.nameDe}
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    ({selectedRoomImages.length} {selectedRoomImages.length === 1 ? 'Foto' : 'Fotos'})
                  </span>
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setSelectedRoom(null)
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Gallery Content */}
          <div className="flex-1 container mx-auto px-4 py-8">
            <div className="h-full max-w-6xl mx-auto">
              {createCollageLayout(selectedRoomImages)}
            </div>
          </div>
        </div>
      )}
    </>
  )
}