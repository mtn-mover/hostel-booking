'use client'

import Image from 'next/image'
import { useState } from 'react'

interface ApartmentGalleryProps {
  images: string[]
}

// Extract room name from image path
const getRoomName = (imagePath: string): string => {
  const filename = imagePath.split('/').pop() || ''
  
  if (filename.includes('Wohnzimmer')) return 'Wohnzimmer'
  if (filename.includes('Essbereich')) return 'Essbereich'
  if (filename.includes('Schlaffzimmer1')) return 'Schlafzimmer 1'
  if (filename.includes('Schlaffzimmer2')) return 'Schlafzimmer 2'
  if (filename.includes('Badezimmer')) return 'Badezimmer'
  if (filename.includes('Aussenbereich')) return 'Außenbereich'
  if (filename.includes('Von Aussen')) return 'Außenansicht'
  if (filename.includes('Eingang')) return 'Eingang'
  if (filename.includes('Gang')) return 'Flur'
  if (filename.includes('Todo')) return 'Details'
  
  return 'Weitere Bilder'
}

// Organize images by room like Airbnb
const organizeImagesByRoom = (images: string[]) => {
  const rooms: { [key: string]: string[] } = {}
  
  images.forEach(image => {
    const roomName = getRoomName(image)
    if (!rooms[roomName]) {
      rooms[roomName] = []
    }
    rooms[roomName].push(image)
  })
  
  return rooms
}

export function ApartmentGallery({ images }: ApartmentGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'overview' | 'room'>('overview')
  const [scrollPosition, setScrollPosition] = useState(0)

  if (images.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
        <span className="text-gray-400 text-lg">No images available</span>
      </div>
    )
  }

  const imagesByRoom = organizeImagesByRoom(images)
  const roomNames = Object.keys(imagesByRoom)

  // Show room-specific modal
  if (viewMode === 'room' && selectedRoom) {
    const roomImages = imagesByRoom[selectedRoom]
    
    return (
      /* Modal Overlay */
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
        <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-2xl font-semibold text-gray-900">
              {selectedRoom} ({roomImages.length} Bilder)
            </h3>
            <button
              onClick={() => {
                setViewMode('overview')
                setSelectedRoom(null)
                // Restore scroll position
                setTimeout(() => {
                  window.scrollTo(0, scrollPosition)
                }, 0)
              }}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal Content - Collage */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {roomImages.length === 1 ? (
              /* Single image - full width */
              <div className="relative h-96 rounded-lg overflow-hidden">
                <Image
                  src={roomImages[0]}
                  alt={`${selectedRoom} 1`}
                  fill
                  className="object-cover"
                />
              </div>
            ) : roomImages.length === 2 ? (
              /* Two images - side by side */
              <div className="grid grid-cols-2 gap-4 h-96">
                {roomImages.map((image, index) => (
                  <div key={index} className="relative rounded-lg overflow-hidden">
                    <Image
                      src={image}
                      alt={`${selectedRoom} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : roomImages.length === 3 ? (
              /* Three images - main + 2 smaller */
              <div className="grid grid-cols-2 gap-4 h-96">
                <div className="relative rounded-lg overflow-hidden">
                  <Image
                    src={roomImages[0]}
                    alt={`${selectedRoom} 1`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="grid grid-rows-2 gap-4">
                  {roomImages.slice(1).map((image, index) => (
                    <div key={index + 1} className="relative rounded-lg overflow-hidden">
                      <Image
                        src={image}
                        alt={`${selectedRoom} ${index + 2}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : roomImages.length === 4 ? (
              /* Four images - 2x2 grid */
              <div className="grid grid-cols-2 gap-4 h-96">
                {roomImages.map((image, index) => (
                  <div key={index} className="relative rounded-lg overflow-hidden">
                    <Image
                      src={image}
                      alt={`${selectedRoom} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              /* 5+ images - main + grid */
              <div className="space-y-4">
                {/* Main large image */}
                <div className="relative h-64 rounded-lg overflow-hidden">
                  <Image
                    src={roomImages[0]}
                    alt={`${selectedRoom} 1`}
                    fill
                    className="object-cover"
                  />
                </div>
                {/* Grid of remaining images */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {roomImages.slice(1).map((image, index) => (
                    <div key={index + 1} className="relative h-24 rounded-lg overflow-hidden">
                      <Image
                        src={image}
                        alt={`${selectedRoom} ${index + 2}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Show compact main image only
  return (
    <div>
      {/* Main Image Display - Compact */}
      <div className="relative h-full w-full overflow-hidden rounded-lg">
        <Image
          src={images[0]}
          alt={`${getRoomName(images[0])} Hauptbild`}
          fill
          className="object-cover"
          priority
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
          }}
        />
        
      </div>
    </div>
  )
}