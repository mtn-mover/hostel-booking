'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X, Maximize2, Grid3x3 } from 'lucide-react'
import { SmartImageContainer } from './smart-image-container'

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

export function RoomCollageGallery({ images, roomCategories, apartmentName }: Props) {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [showFullscreen, setShowFullscreen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

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

  // Check if scrolling is needed and update arrow visibility
  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
        setShowLeftArrow(scrollLeft > 0)
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1)
      }
    }

    const container = scrollContainerRef.current
    if (container) {
      checkScroll()
      container.addEventListener('scroll', checkScroll)
      window.addEventListener('resize', checkScroll)
      
      return () => {
        container.removeEventListener('scroll', checkScroll)
        window.removeEventListener('resize', checkScroll)
      }
    }
  }, [visibleRooms])

  // Get images for selected room
  const selectedRoomImages = selectedRoom ? imagesByRoom[selectedRoom] : []
  const selectedRoomData = visibleRooms.find(r => r.id === selectedRoom)

  const scrollRooms = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const cardWidth = 150
      const gap = 16
      const scrollAmount = (cardWidth + gap) * 2 // Scroll 2 cards at a time
      const currentScroll = scrollContainerRef.current.scrollLeft
      const newScroll = direction === 'left' 
        ? Math.max(0, currentScroll - scrollAmount)
        : currentScroll + scrollAmount
      
      scrollContainerRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      })
    }
  }

  const createCollageLayout = (images: ApartmentImage[]) => {
    const count = images.length
    
    if (count === 0) return null
    if (count === 1) {
      return (
        <div className="w-full h-full relative overflow-hidden rounded-lg">
          <SmartImageContainer
            src={images[0].url}
            alt={images[0].alt}
            onClick={() => {
              setSelectedImageIndex(0)
              setShowFullscreen(true)
            }}
            className="w-full h-full"
          />
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Klicken für Vollansicht
          </div>
        </div>
      )
    }
    
    if (count === 2) {
      return (
        <div className="grid grid-cols-2 gap-2 h-full">
          {images.slice(0, 2).map((img, idx) => (
            <div key={img.id} className="relative overflow-hidden rounded-lg">
              <SmartImageContainer
                src={img.url}
                alt={img.alt}
                onClick={() => {
                  setSelectedImageIndex(idx)
                  setShowFullscreen(true)
                }}
                className="w-full h-full"
              />
            </div>
          ))}
        </div>
      )
    }
    
    if (count === 3) {
      return (
        <div className="grid grid-cols-2 gap-2 h-full">
          <div className="col-span-1 row-span-2 relative overflow-hidden rounded-lg">
            <SmartImageContainer
              src={images[0].url}
              alt={images[0].alt}
              onClick={() => {
                setSelectedImageIndex(0)
                setShowFullscreen(true)
              }}
              className="w-full h-full"
            />
          </div>
          <div className="col-span-1 grid grid-rows-2 gap-2">
            {images.slice(1, 3).map((img, idx) => (
              <div key={img.id} className="relative overflow-hidden rounded-lg">
                <SmartImageContainer
                  src={img.url}
                  alt={img.alt}
                  onClick={() => {
                    setSelectedImageIndex(idx + 1)
                    setShowFullscreen(true)
                  }}
                  className="w-full h-full"
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
          {images.slice(0, 4).map((img, idx) => (
            <div key={img.id} className="relative overflow-hidden rounded-lg">
              <SmartImageContainer
                src={img.url}
                alt={img.alt}
                onClick={() => {
                  setSelectedImageIndex(idx)
                  setShowFullscreen(true)
                }}
                className="w-full h-full"
              />
            </div>
          ))}
        </div>
      )
    }
    
    // 5+ images: Special layout
    return (
      <div className="grid grid-cols-3 grid-rows-2 gap-2 h-full">
        <div className="col-span-2 row-span-2 relative overflow-hidden rounded-lg">
          <SmartImageContainer
            src={images[0].url}
            alt={images[0].alt}
            onClick={() => {
              setSelectedImageIndex(0)
              setShowFullscreen(true)
            }}
            className="w-full h-full"
          />
        </div>
        <div className="col-span-1 row-span-2 grid grid-rows-3 gap-2">
          {images.slice(1, 4).map((img, idx) => (
            <div key={img.id} className="relative overflow-hidden rounded-lg">
              <SmartImageContainer
                src={img.url}
                alt={img.alt}
                onClick={() => {
                  setSelectedImageIndex(idx + 1)
                  setShowFullscreen(true)
                }}
                className="w-full h-full"
              />
              {idx === 2 && count > 4 && (
                <div
                  className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center cursor-pointer hover:bg-black/70 z-10"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImageIndex(3)
                    setShowFullscreen(true)
                  }}
                >
                  <span className="text-white font-semibold text-xl">
                    +{count - 4} more
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (visibleRooms.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Room Selector - Horizontal Scrollable */}
      <div className="relative">
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Room Gallery</h3>
          <p className="text-sm text-gray-600">Explore each room individually</p>
        </div>
        
        <div className="relative">
          {/* Scrollable Room Cards - Single Row with Snap */}
          <div 
            ref={scrollContainerRef}
            className="relative flex gap-4 overflow-x-auto scrollbar-hide pb-3 px-1" 
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              scrollSnapType: 'x mandatory',
              scrollPaddingLeft: '4px',
              scrollPaddingRight: '4px'
            }}
          >
            {visibleRooms.map((room, index) => {
              const roomImages = imagesByRoom[room.id]
              const firstImage = roomImages?.[0]
              
              return (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room.id === selectedRoom ? null : room.id)}
                  className={`flex-shrink-0 transition-all rounded-lg overflow-hidden ${
                    selectedRoom === room.id 
                      ? 'ring-2 ring-blue-600 ring-offset-2' 
                      : 'hover:shadow-lg'
                  }`}
                  style={{ 
                    width: '150px',
                    scrollSnapAlign: 'start'
                  }}
                >
                  <div className="relative aspect-[4/3] bg-white">
                    {firstImage && (
                      <SmartImageContainer
                        src={firstImage.url}
                        alt={room.nameDe}
                        className="w-full h-full"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
                      <p className="font-medium text-sm text-center">{room.nameDe}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
          
          {/* Left Arrow - Only show when scrollable to left */}
          {showLeftArrow && (
            <button
              onClick={() => scrollRooms('left')}
              className="absolute left-0 top-[50%] -translate-y-1/2 z-10 p-2 bg-gray-100 hover:bg-gray-100 rounded-full shadow-md border border-gray-200 transition-all opacity-90 hover:opacity-100 -ml-3"
              style={{ top: 'calc(50% - 8px)' }}
            >
              <ChevronLeft className="w-4 h-4 text-gray-700" />
            </button>
          )}

          {/* Right Arrow - Only show when scrollable to right */}
          {showRightArrow && (
            <button
              onClick={() => scrollRooms('right')}
              className="absolute right-0 top-[50%] -translate-y-1/2 z-10 p-2 bg-gray-100 hover:bg-gray-100 rounded-full shadow-md border border-gray-200 transition-all opacity-90 hover:opacity-100 -mr-3"
              style={{ top: 'calc(50% - 8px)' }}
            >
              <ChevronRight className="w-4 h-4 text-gray-700" />
            </button>
          )}
        </div>
      </div>

      {/* Selected Room Collage Modal */}
      {selectedRoom && selectedRoomImages.length > 0 && (
        <div className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <div>
                <h4 className="text-xl font-semibold text-gray-900">
                  {selectedRoomData?.nameDe}
                </h4>
                <p className="text-sm text-gray-500">
                  {selectedRoomImages.length} {selectedRoomImages.length === 1 ? 'Foto' : 'Fotos'}
                </p>
              </div>
              <button
                onClick={() => setSelectedRoom(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="bg-white rounded-lg overflow-hidden border border-gray-200" style={{ height: '500px' }}>
                {createCollageLayout(selectedRoomImages)}
              </div>

              {/* Thumbnail Strip */}
              {selectedRoomImages.length > 4 && (
                <div className="mt-4 flex gap-2 overflow-x-auto py-2">
                  {selectedRoomImages.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => {
                        setSelectedImageIndex(idx)
                        setShowFullscreen(true)
                      }}
                      className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 bg-white border border-gray-200"
                    >
                      <SmartImageContainer
                        src={img.url}
                        alt={img.alt}
                        className="w-full h-full"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Modal */}
      {showFullscreen && selectedRoomImages.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <button
            onClick={() => setShowFullscreen(false)}
            className="absolute top-4 right-4 p-2 bg-gray-100/20 hover:bg-gray-100/30 rounded-full text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {selectedImageIndex > 0 && (
            <button
              onClick={() => setSelectedImageIndex(prev => prev - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-gray-100/20 hover:bg-gray-100/30 rounded-full text-white transition-colors"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {selectedImageIndex < selectedRoomImages.length - 1 && (
            <button
              onClick={() => setSelectedImageIndex(prev => prev + 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-gray-100/20 hover:bg-gray-100/30 rounded-full text-white transition-colors"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

          <img
            src={selectedRoomImages[selectedImageIndex]?.url}
            alt={selectedRoomImages[selectedImageIndex]?.alt}
            className="max-w-full max-h-full"
          />

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full">
            {selectedRoomData?.nameDe} - {selectedImageIndex + 1} / {selectedRoomImages.length}
          </div>
        </div>
      )}
    </div>
  )
}