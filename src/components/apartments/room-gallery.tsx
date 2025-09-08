'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react'

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

export function RoomGallery({ images, roomCategories, apartmentName }: Props) {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<number>(0)
  const [showFullscreen, setShowFullscreen] = useState(false)

  // Group images by room
  const imagesByRoom = roomCategories.reduce((acc, room) => {
    const roomImages = images.filter(img => img.roomId === room.id)
    if (roomImages.length > 0) {
      acc[room.id] = roomImages.sort((a, b) => a.order - b.order)
    }
    return acc
  }, {} as Record<string, ApartmentImage[]>)

  // Get rooms with images (maintaining order)
  const visibleRooms = roomCategories.filter(room => imagesByRoom[room.id]?.length > 0)

  // Get all images for the selected room or all rooms
  const displayImages = selectedRoom 
    ? imagesByRoom[selectedRoom] || []
    : images.sort((a, b) => a.order - b.order)

  const currentImage = displayImages[selectedImage]

  const handlePrevImage = () => {
    setSelectedImage(prev => prev > 0 ? prev - 1 : displayImages.length - 1)
  }

  const handleNextImage = () => {
    setSelectedImage(prev => prev < displayImages.length - 1 ? prev + 1 : 0)
  }

  const handleRoomSelect = (roomId: string | null) => {
    setSelectedRoom(roomId)
    setSelectedImage(0)
  }

  if (visibleRooms.length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <p className="text-gray-500">No images available for this apartment.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Room Tabs */}
      <div className="flex flex-wrap gap-2 border-b">
        <button
          onClick={() => handleRoomSelect(null)}
          className={`px-4 py-2 font-medium transition-colors ${
            selectedRoom === null
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All Rooms
        </button>
        {visibleRooms.map(room => (
          <button
            key={room.id}
            onClick={() => handleRoomSelect(room.id)}
            className={`px-4 py-2 font-medium transition-colors ${
              selectedRoom === room.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {room.nameDe}
            {imagesByRoom[room.id] && (
              <span className="ml-2 text-sm text-gray-400">
                ({imagesByRoom[room.id].length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Main Image Display */}
      <div className="relative aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden">
        {currentImage && (
          <>
            <img
              src={currentImage.url}
              alt={currentImage.alt || apartmentName}
              className="w-full h-full object-cover"
            />
            
            {/* Navigation Arrows */}
            {displayImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Fullscreen Button */}
            <button
              onClick={() => setShowFullscreen(true)}
              className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-colors"
            >
              <Maximize2 className="w-5 h-5" />
            </button>

            {/* Image Counter */}
            <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/50 text-white rounded-full text-sm">
              {selectedImage + 1} / {displayImages.length}
            </div>

            {/* Room Label */}
            {selectedRoom && visibleRooms.find(r => r.id === selectedRoom) && (
              <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 text-white rounded-full text-sm">
                {visibleRooms.find(r => r.id === selectedRoom)?.nameDe}
              </div>
            )}
          </>
        )}
      </div>

      {/* Thumbnail Grid */}
      <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
        {displayImages.map((image, index) => (
          <button
            key={image.id}
            onClick={() => setSelectedImage(index)}
            className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
              index === selectedImage
                ? 'border-blue-600 ring-2 ring-blue-200'
                : 'border-transparent hover:border-gray-300'
            }`}
          >
            <img
              src={image.url}
              alt={image.alt || `Image ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Room Grid Preview */}
      {!selectedRoom && visibleRooms.length > 1 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Browse by Room</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {visibleRooms.map(room => {
              const roomImages = imagesByRoom[room.id]
              const firstImage = roomImages?.[0]
              
              if (!firstImage) return null

              return (
                <button
                  key={room.id}
                  onClick={() => handleRoomSelect(room.id)}
                  className="group relative aspect-[4/3] rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <img
                    src={firstImage.url}
                    alt={room.nameDe}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <h4 className="font-medium">{room.nameDe}</h4>
                    <p className="text-sm opacity-90">
                      {roomImages.length} {roomImages.length === 1 ? 'Bild' : 'Bilder'}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Fullscreen Modal */}
      {showFullscreen && currentImage && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <button
            onClick={() => setShowFullscreen(false)}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <img
            src={currentImage.url}
            alt={currentImage.alt || apartmentName}
            className="max-w-full max-h-full"
          />

          {displayImages.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 text-white rounded-full">
            {selectedImage + 1} / {displayImages.length}
          </div>
        </div>
      )}
    </div>
  )
}