'use client'

import { useState, useEffect } from 'react'
import { Upload, X, Plus, Image as ImageIcon, GripVertical, Eye, EyeOff, Loader2 } from 'lucide-react'

interface RoomCategory {
  id: string
  name: string
  nameEn: string
  nameDe: string
  order: number
  isDefault: boolean
  icon?: string
}

interface ApartmentImage {
  id?: string
  url: string
  alt?: string
  roomId?: string
  order: number
}

interface Props {
  apartmentId: string
  existingImages: ApartmentImage[]
  roomCategories: RoomCategory[]
}

export function RoomImageManager({ apartmentId, existingImages, roomCategories }: Props) {
  const [images, setImages] = useState<ApartmentImage[]>([])
  const [selectedRoom, setSelectedRoom] = useState<string>('')
  const [uploadingRoom, setUploadingRoom] = useState<string | null>(null)
  const [newRoomName, setNewRoomName] = useState('')
  const [showAddRoom, setShowAddRoom] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Fetch images on mount
  useEffect(() => {
    if (!isInitialized) {
      if (existingImages && existingImages.length > 0) {
        setImages(existingImages)
      }
      fetchImages()
      setIsInitialized(true)
    }
  }, [existingImages, isInitialized])

  const fetchImages = async () => {
    try {
      const response = await fetch(`/api/admin/apartments/images?apartmentId=${apartmentId}`)
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched images:', data)
        setImages(data || [])
      } else {
        console.error('Failed to fetch images:', response.status)
      }
    } catch (error) {
      console.error('Failed to fetch images:', error)
    }
  }

  // Group images by room
  const imagesByRoom = roomCategories.reduce((acc, room) => {
    acc[room.id] = (images || []).filter(img => img.roomId === room.id)
    return acc
  }, {} as Record<string, ApartmentImage[]>)

  // Get rooms with images
  const roomsWithImages = roomCategories.filter(room => imagesByRoom[room.id]?.length > 0)

  const handleImageUpload = async (roomId: string, files: FileList) => {
    if (!files || files.length === 0) return
    
    setUploadingRoom(roomId)
    setIsLoading(true)

    const formData = new FormData()
    formData.append('apartmentId', apartmentId)
    formData.append('roomId', roomId)
    
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i])
    }

    try {
      const response = await fetch('/api/admin/apartments/images', {
        method: 'POST',
        body: formData
      })

      const responseData = await response.json()
      
      if (response.ok) {
        console.log('Upload successful:', responseData)
        // Don't manually add images, just refetch
        await fetchImages()
      } else {
        console.error('Upload failed:', responseData)
        alert('Failed to upload images: ' + (responseData.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload images. Please try again.')
    } finally {
      setUploadingRoom(null)
      setIsLoading(false)
    }
  }

  const handleImageDelete = async (imageId: string) => {
    if (!imageId) return
    if (!confirm('Are you sure you want to delete this image?')) return

    try {
      const response = await fetch(`/api/admin/apartments/images/${imageId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchImages()
      } else {
        alert('Failed to delete image')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete image')
    }
  }

  const handleImageReorder = async (roomId: string, fromIndex: number, toIndex: number) => {
    const roomImages = imagesByRoom[roomId]
    const reorderedImages = [...roomImages]
    const [movedImage] = reorderedImages.splice(fromIndex, 1)
    reorderedImages.splice(toIndex, 0, movedImage)

    // Update order values
    const updatedImages = reorderedImages.map((img, index) => ({
      ...img,
      order: index
    }))

    // Update state optimistically
    const otherImages = images.filter(img => img.roomId !== roomId)
    setImages([...otherImages, ...updatedImages])

    // Save to backend
    try {
      await fetch('/api/admin/apartments/images/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: updatedImages })
      })
    } catch (error) {
      console.error('Reorder error:', error)
      // Revert on error
      await fetchImages()
    }
  }

  const handleAddCustomRoom = async () => {
    if (!newRoomName.trim()) return

    try {
      const response = await fetch('/api/admin/room-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRoomName.toLowerCase().replace(/\s+/g, '_'),
          nameEn: newRoomName,
          nameDe: newRoomName,
          isDefault: false
        })
      })

      if (response.ok) {
        const newRoom = await response.json()
        window.location.reload() // Reload to get updated room categories
      } else {
        alert('Failed to add custom room')
      }
    } catch (error) {
      console.error('Add room error:', error)
      alert('Failed to add custom room')
    }

    setNewRoomName('')
    setShowAddRoom(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Image Management by Room</h3>
        <button
          onClick={() => setShowAddRoom(!showAddRoom)}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Custom Room
        </button>
      </div>

      {/* Add Custom Room Form */}
      {showAddRoom && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Enter room name (e.g., Storage Room)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddCustomRoom}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Add Room
            </button>
            <button
              onClick={() => {
                setShowAddRoom(false)
                setNewRoomName('')
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500">
          Total images loaded: {images.length}
        </div>
      )}

      {/* Room Categories with Images */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {roomCategories.map(room => {
          const roomImages = imagesByRoom[room.id] || []
          const hasImages = roomImages.length > 0

          return (
            <div
              key={room.id}
              className={`border rounded-lg overflow-hidden ${hasImages ? 'border-blue-200 bg-blue-50/20' : 'border-gray-200'}`}
            >
              {/* Room Header */}
              <div className="bg-white px-4 py-3 border-b flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900">
                    {room.nameDe} / {room.nameEn}
                  </h4>
                  {room.isDefault === false && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      Custom
                    </span>
                  )}
                  <span className="text-sm text-gray-500">
                    ({roomImages.length} {roomImages.length === 1 ? 'image' : 'images'})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {hasImages && (
                    <button
                      title={hasImages ? "Room visible" : "Room hidden (no images)"}
                      className="text-gray-400"
                      disabled
                    >
                      {hasImages ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Image Grid */}
              <div className="p-4 bg-white">
                {roomImages.length === 0 && !uploadingRoom && (
                  <div className="text-center text-gray-500 text-sm mb-4">
                    <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p>No images in this room</p>
                    <p className="text-xs text-gray-400 mt-1">
                      This room will be hidden on the public page
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2">
                  {roomImages
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((image, index) => (
                      <div
                        key={image.id || `temp-${index}`}
                        className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden"
                      >
                        <img
                          src={image.url}
                          alt={image.alt || `${room.nameEn} image ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Image load error:', e)
                            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23f3f4f6"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="sans-serif" font-size="12"%3EError%3C/text%3E%3C/svg%3E'
                          }}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          {image.id && (
                            <button
                              onClick={() => handleImageDelete(image.id!)}
                              className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                              title="Delete image"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                          #{index + 1}
                        </div>
                      </div>
                    ))}

                  {/* Upload Button */}
                  <label className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleImageUpload(room.id, e.target.files)
                          e.target.value = '' // Reset input
                        }
                      }}
                      disabled={uploadingRoom === room.id || isLoading}
                    />
                    {uploadingRoom === room.id ? (
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 text-blue-600 mx-auto animate-spin" />
                        <span className="text-xs text-gray-500 mt-2">Uploading...</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-gray-400" />
                        <span className="text-xs text-gray-500 mt-1">Add Images</span>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">How Room Images Work</h4>
        <ul className="space-y-1 text-sm text-blue-700">
          <li>• Only rooms with images will be displayed on the apartment page</li>
          <li>• Upload multiple images per room for better presentation</li>
          <li>• Images are automatically organized by room category</li>
          <li>• Add custom rooms for special areas not in the default list</li>
          <li>• The first image in each room is used as the room's preview</li>
          <li>• Maximum file size: 5MB per image</li>
        </ul>
      </div>
    </div>
  )
}