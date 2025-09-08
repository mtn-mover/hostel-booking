'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X, Grid3x3, Maximize2 } from 'lucide-react'

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

export function CompactRoomGallery({ images, roomCategories, apartmentName }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

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

  // Get rooms with images (maintaining order)
  const visibleRooms = roomCategories.filter(room => imagesByRoom[room.id]?.length > 0)

  if (visibleRooms.length === 0) {
    return null
  }

  const currentRoom = visibleRooms[currentRoomIndex]
  const currentRoomImages = currentRoom ? imagesByRoom[currentRoom.id] : []

  const scrollRooms = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 180
      const currentScroll = scrollContainerRef.current.scrollLeft
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount
      
      scrollContainerRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      })
    }
  }

  const navigateRoom = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentRoomIndex > 0) {
      setCurrentRoomIndex(currentRoomIndex - 1)
      setSelectedImageIndex(0)
    } else if (direction === 'next' && currentRoomIndex < visibleRooms.length - 1) {
      setCurrentRoomIndex(currentRoomIndex + 1)
      setSelectedImageIndex(0)
    }
  }

  const navigateImage = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1)
    } else if (direction === 'next' && selectedImageIndex < currentRoomImages.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1)
    }
  }

  const createMiniCollage = (images: ApartmentImage[], roomName: string) => {
    const count = Math.min(images.length, 4)
    
    if (count === 1) {
      return (
        <img src={images[0].url} alt={roomName} className="w-full h-full object-cover" />
      )
    }
    
    if (count === 2) {
      return (
        <div className="grid grid-cols-2 gap-0.5 h-full">
          {images.slice(0, 2).map((img, idx) => (
            <img key={idx} src={img.url} alt={roomName} className="w-full h-full object-cover" />
          ))}
        </div>
      )
    }
    
    if (count === 3) {
      return (
        <div className="grid grid-cols-2 grid-rows-2 gap-0.5 h-full">
          <img src={images[0].url} alt={roomName} className="col-span-1 row-span-2 w-full h-full object-cover" />
          <img src={images[1].url} alt={roomName} className="col-span-1 row-span-1 w-full h-full object-cover" />
          <img src={images[2].url} alt={roomName} className="col-span-1 row-span-1 w-full h-full object-cover" />
        </div>
      )
    }
    
    return (
      <div className="grid grid-cols-2 grid-rows-2 gap-0.5 h-full">
        {images.slice(0, 4).map((img, idx) => (
          <div key={idx} className="relative">
            <img src={img.url} alt={roomName} className="w-full h-full object-cover" />
            {idx === 3 && images.length > 4 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-semibold text-sm">+{images.length - 4}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      {/* Compact Room Selector */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Grid3x3 className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Room Gallery</h3>
            <span className="text-sm text-gray-500">({visibleRooms.length} rooms)</span>
          </div>
          {visibleRooms.length > 4 && (
            <div className="flex gap-1">
              <button
                onClick={() => scrollRooms('left')}
                className="p-1 hover:bg-gray-100 rounded-full transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollRooms('right')}
                className="p-1 hover:bg-gray-100 rounded-full transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Room Cards - Max 4 visible */}
        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {visibleRooms.map((room, index) => {
            const roomImages = imagesByRoom[room.id]
            
            return (
              <button
                key={room.id}
                onClick={() => {
                  setCurrentRoomIndex(index)
                  setSelectedImageIndex(0)
                  setShowModal(true)
                }}
                className="flex-shrink-0 group hover:shadow-md transition-shadow rounded-lg overflow-hidden"
                style={{ width: 'calc(25% - 9px)', minWidth: '150px' }}
              >
                <div className="relative aspect-square bg-gray-100">
                  {createMiniCollage(roomImages, room.nameDe)}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70">
                    <p className="text-white font-medium text-sm truncate">{room.nameDe}</p>
                    <p className="text-white/80 text-xs">
                      {roomImages.length} {roomImages.length === 1 ? 'Bild' : 'Bilder'}
                    </p>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/90 rounded-full p-1">
                      <Maximize2 className="w-4 h-4 text-gray-700" />
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Modal Gallery */}
      {showModal && currentRoom && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 text-white">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-semibold">{currentRoom.nameDe}</h3>
              <span className="text-sm opacity-75">
                {currentRoomIndex + 1} / {visibleRooms.length} Räume
              </span>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="p-2 hover:bg-white/20 rounded-full transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main Image Display */}
          <div className="flex-1 flex items-center justify-center relative px-16">
            {/* Room Navigation */}
            {currentRoomIndex > 0 && (
              <button
                onClick={() => navigateRoom('prev')}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 rounded-full transition"
              >
                <ChevronLeft className="w-8 h-8 text-white" />
              </button>
            )}
            
            {currentRoomIndex < visibleRooms.length - 1 && (
              <button
                onClick={() => navigateRoom('next')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 rounded-full transition"
              >
                <ChevronRight className="w-8 h-8 text-white" />
              </button>
            )}

            {/* Image Display with Navigation */}
            <div className="relative max-w-5xl w-full">
              {currentRoomImages.length > 1 && (
                <>
                  {selectedImageIndex > 0 && (
                    <button
                      onClick={() => navigateImage('prev')}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/20 hover:bg-white/30 rounded-full transition"
                    >
                      <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                  )}
                  
                  {selectedImageIndex < currentRoomImages.length - 1 && (
                    <button
                      onClick={() => navigateImage('next')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/20 hover:bg-white/30 rounded-full transition"
                    >
                      <ChevronRight className="w-6 h-6 text-white" />
                    </button>
                  )}
                </>
              )}

              <img
                src={currentRoomImages[selectedImageIndex]?.url}
                alt={currentRoomImages[selectedImageIndex]?.alt || currentRoom.nameDe}
                className="w-full h-full max-h-[70vh] object-contain"
              />

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {selectedImageIndex + 1} / {currentRoomImages.length}
              </div>
            </div>
          </div>

          {/* Thumbnail Strip */}
          {currentRoomImages.length > 1 && (
            <div className="p-4 flex gap-2 justify-center overflow-x-auto">
              {currentRoomImages.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                    idx === selectedImageIndex
                      ? 'border-white'
                      : 'border-transparent opacity-60 hover:opacity-100'
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

          {/* Room Quick Navigation */}
          <div className="p-4 border-t border-white/20">
            <div className="flex gap-2 justify-center overflow-x-auto">
              {visibleRooms.map((room, idx) => (
                <button
                  key={room.id}
                  onClick={() => {
                    setCurrentRoomIndex(idx)
                    setSelectedImageIndex(0)
                  }}
                  className={`px-4 py-2 rounded-full text-sm transition ${
                    idx === currentRoomIndex
                      ? 'bg-white text-black'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {room.nameDe}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}