'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

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

export function SimpleRoomGallery({ images, roomCategories, apartmentName }: Props) {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

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

  // Modal images
  const modalImages = selectedRoom ? imagesByRoom[selectedRoom] : []
  const selectedRoomData = visibleRooms.find(r => r.id === selectedRoom)

  const createCollage = (images: ApartmentImage[]) => {
    const count = images.length
    
    if (count === 1) {
      return (
        <img
          src={images[0].url}
          alt={images[0].alt}
          className="w-full h-full object-cover"
        />
      )
    }
    
    if (count === 2) {
      return (
        <div className="grid grid-cols-2 gap-1 h-full">
          {images.slice(0, 2).map((img, idx) => (
            <img
              key={idx}
              src={img.url}
              alt={img.alt}
              className="w-full h-full object-cover"
            />
          ))}
        </div>
      )
    }
    
    if (count === 3) {
      return (
        <div className="grid grid-cols-2 gap-1 h-full">
          <img
            src={images[0].url}
            alt={images[0].alt}
            className="col-span-1 row-span-2 w-full h-full object-cover"
          />
          <div className="col-span-1 grid grid-rows-2 gap-1">
            {images.slice(1, 3).map((img, idx) => (
              <img
                key={idx}
                src={img.url}
                alt={img.alt}
                className="w-full h-full object-cover"
              />
            ))}
          </div>
        </div>
      )
    }
    
    // 4+ images
    return (
      <div className="grid grid-cols-2 grid-rows-2 gap-1 h-full">
        {images.slice(0, 4).map((img, idx) => (
          <div key={idx} className="relative">
            <img
              src={img.url}
              alt={img.alt}
              className="w-full h-full object-cover"
            />
            {idx === 3 && count > 4 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-bold text-lg">+{count - 4}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  if (!mainImage) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Main Image - Small and compact */}
      <div className="relative h-[250px] md:h-[300px] rounded-lg overflow-hidden bg-gray-100">
        <img
          src={mainImage.url}
          alt={mainImage.alt || apartmentName}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Room Collages */}
      {visibleRooms.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Räume</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {visibleRooms.map(room => {
              const roomImages = imagesByRoom[room.id]
              
              return (
                <div
                  key={room.id}
                  onClick={() => {
                    setSelectedRoom(room.id)
                    setSelectedImageIndex(0)
                  }}
                  className="cursor-pointer group"
                >
                  <div className="relative h-40 md:h-48 rounded-lg overflow-hidden bg-gray-100 mb-2 group-hover:shadow-lg transition-shadow">
                    {createCollage(roomImages)}
                  </div>
                  <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                    {room.nameDe}
                  </p>
                  <p className="text-sm text-gray-500">
                    {roomImages.length} {roomImages.length === 1 ? 'Bild' : 'Bilder'}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Modal for room images */}
      {selectedRoom && modalImages.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh]">
            <button
              onClick={() => setSelectedRoom(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition"
            >
              <X className="w-8 h-8" />
            </button>
            
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">{selectedRoomData?.nameDe}</h3>
                <p className="text-sm text-gray-500">
                  {modalImages.length} {modalImages.length === 1 ? 'Bild' : 'Bilder'}
                </p>
              </div>
              
              <div className="relative h-[60vh]">
                <img
                  src={modalImages[selectedImageIndex]?.url}
                  alt={modalImages[selectedImageIndex]?.alt}
                  className="w-full h-full object-contain bg-gray-100"
                />
                
                {modalImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {modalImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`w-2 h-2 rounded-full transition ${
                          idx === selectedImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {modalImages.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {modalImages.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded overflow-hidden border-2 transition ${
                        idx === selectedImageIndex
                          ? 'border-blue-600'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={img.alt}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}