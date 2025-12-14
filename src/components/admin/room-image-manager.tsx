'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, X, Plus, Image as ImageIcon, GripVertical, Eye, EyeOff, Loader2, Pencil, Check } from 'lucide-react'

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

interface PendingUpload {
  file: File
  preview: string
  title: string
  description: string
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
  const [editingImageId, setEditingImageId] = useState<string | null>(null)
  const [editingAlt, setEditingAlt] = useState('')
  const [savingAlt, setSavingAlt] = useState(false)

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([])
  const [uploadRoomId, setUploadRoomId] = useState<string>('')
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

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

  // Open upload modal when files are selected
  const handleFileSelect = (roomId: string, files: FileList) => {
    if (!files || files.length === 0) return

    const newPendingUploads: PendingUpload[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      newPendingUploads.push({
        file,
        preview: URL.createObjectURL(file),
        title: '',
        description: ''
      })
    }

    // If modal is already open (adding more files), append to existing
    if (showUploadModal && uploadRoomId === roomId) {
      setPendingUploads(prev => [...prev, ...newPendingUploads])
    } else {
      setPendingUploads(newPendingUploads)
      setUploadRoomId(roomId)
      setShowUploadModal(true)
    }
  }

  // Update title for a pending upload
  const updatePendingTitle = (index: number, title: string) => {
    setPendingUploads(prev => prev.map((upload, i) =>
      i === index ? { ...upload, title } : upload
    ))
  }

  // Update description for a pending upload
  const updatePendingDescription = (index: number, description: string) => {
    setPendingUploads(prev => prev.map((upload, i) =>
      i === index ? { ...upload, description } : upload
    ))
  }

  // Remove a pending upload
  const removePendingUpload = (index: number) => {
    setPendingUploads(prev => {
      const newUploads = [...prev]
      URL.revokeObjectURL(newUploads[index].preview)
      newUploads.splice(index, 1)
      return newUploads
    })
  }

  // Cancel upload modal
  const cancelUploadModal = () => {
    // Clean up preview URLs
    pendingUploads.forEach(upload => URL.revokeObjectURL(upload.preview))
    setPendingUploads([])
    setUploadRoomId('')
    setShowUploadModal(false)
  }

  // Confirm and upload images
  const handleConfirmUpload = async () => {
    if (pendingUploads.length === 0) return

    setShowUploadModal(false)
    setUploadingRoom(uploadRoomId)
    setIsLoading(true)

    const formData = new FormData()
    formData.append('apartmentId', apartmentId)
    formData.append('roomId', uploadRoomId)

    // Add files
    pendingUploads.forEach((upload, index) => {
      formData.append('images', upload.file)
    })

    // Add titles and descriptions as JSON arrays
    const titles = pendingUploads.map(upload => upload.title)
    const descriptions = pendingUploads.map(upload => upload.description)
    formData.append('titles', JSON.stringify(titles))
    formData.append('descriptions', JSON.stringify(descriptions))

    try {
      const response = await fetch('/api/admin/apartments/images', {
        method: 'POST',
        body: formData
      })

      const responseData = await response.json()

      if (response.ok) {
        console.log('Upload successful:', responseData)
        await fetchImages()
      } else {
        console.error('Upload failed:', responseData)
        alert('Fehler beim Hochladen: ' + (responseData.error || 'Unbekannter Fehler'))
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Fehler beim Hochladen. Bitte versuchen Sie es erneut.')
    } finally {
      // Clean up
      pendingUploads.forEach(upload => URL.revokeObjectURL(upload.preview))
      setPendingUploads([])
      setUploadRoomId('')
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

  const handleSaveAlt = async (imageId: string) => {
    if (!imageId) return
    setSavingAlt(true)

    try {
      const response = await fetch(`/api/admin/apartments/images/${imageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alt: editingAlt })
      })

      if (response.ok) {
        // Update local state
        setImages(prev => prev.map(img =>
          img.id === imageId ? { ...img, alt: editingAlt } : img
        ))
        setEditingImageId(null)
        setEditingAlt('')
      } else {
        alert('Fehler beim Speichern der Beschreibung')
      }
    } catch (error) {
      console.error('Save alt error:', error)
      alert('Fehler beim Speichern der Beschreibung')
    } finally {
      setSavingAlt(false)
    }
  }

  const startEditingAlt = (image: ApartmentImage) => {
    setEditingImageId(image.id || null)
    setEditingAlt(image.alt || '')
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

                <div className="grid grid-cols-2 gap-3">
                  {roomImages
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((image, index) => (
                      <div
                        key={image.id || `temp-${index}`}
                        className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200"
                      >
                        {/* Image */}
                        <div className="relative group aspect-video bg-gray-100">
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
                              <>
                                <button
                                  onClick={() => startEditingAlt(image)}
                                  className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                  title="Beschreibung bearbeiten"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleImageDelete(image.id!)}
                                  className="p-2 bg-red-600 text-white rounded hover:bg-red-700"
                                  title="Bild löschen"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                          <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                            #{index + 1}
                          </div>
                        </div>

                        {/* Description */}
                        <div className="p-2">
                          {editingImageId === image.id ? (
                            <div className="flex gap-1">
                              <textarea
                                value={editingAlt}
                                onChange={(e) => setEditingAlt(e.target.value)}
                                placeholder="z.B. Kühlschrank, Kaffeemaschine, Mikrowelle..."
                                className="flex-1 text-xs p-2 border border-gray-300 rounded resize-none focus:ring-1 focus:ring-blue-500"
                                rows={2}
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveAlt(image.id!)}
                                disabled={savingAlt}
                                className="p-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 h-fit"
                                title="Speichern"
                              >
                                {savingAlt ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Check className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setEditingImageId(null)
                                  setEditingAlt('')
                                }}
                                className="p-1 bg-gray-400 text-white rounded hover:bg-gray-500 h-fit"
                                title="Abbrechen"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div
                              onClick={() => image.id && startEditingAlt(image)}
                              className="text-xs text-gray-600 cursor-pointer hover:bg-gray-100 p-1 rounded min-h-[2rem]"
                              title="Klicken um Beschreibung zu bearbeiten"
                            >
                              {image.alt ? (
                                <span>{image.alt}</span>
                              ) : (
                                <span className="text-gray-400 italic">+ Beschreibung hinzufügen</span>
                              )}
                            </div>
                          )}
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
                      ref={(el) => { fileInputRefs.current[room.id] = el }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleFileSelect(room.id, e.target.files)
                          e.target.value = '' // Reset input
                        }
                      }}
                      disabled={uploadingRoom === room.id || isLoading}
                    />
                    {uploadingRoom === room.id ? (
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 text-blue-600 mx-auto animate-spin" />
                        <span className="text-xs text-gray-500 mt-2">Hochladen...</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-gray-400" />
                        <span className="text-xs text-gray-500 mt-1">Bilder hinzufügen</span>
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
        <h4 className="font-medium text-blue-900 mb-2">Wie Raumbilder funktionieren</h4>
        <ul className="space-y-1 text-sm text-blue-700">
          <li>• Nur Räume mit Bildern werden auf der Apartment-Seite angezeigt</li>
          <li>• Laden Sie mehrere Bilder pro Raum für eine bessere Präsentation hoch</li>
          <li>• Bilder werden automatisch nach Raumkategorie organisiert</li>
          <li>• Fügen Sie benutzerdefinierte Räume für spezielle Bereiche hinzu</li>
          <li>• Das erste Bild in jedem Raum wird als Vorschau verwendet</li>
          <li>• Maximale Dateigrösse: 5MB pro Bild</li>
        </ul>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Bilder hochladen
                </h3>
                <p className="text-sm text-gray-500">
                  {roomCategories.find(r => r.id === uploadRoomId)?.nameDe || 'Raum'} - {pendingUploads.length} {pendingUploads.length === 1 ? 'Bild' : 'Bilder'}
                </p>
              </div>
              <button
                onClick={cancelUploadModal}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {pendingUploads.map((upload, index) => (
                  <div
                    key={index}
                    className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    {/* Image Preview */}
                    <div className="w-32 h-24 flex-shrink-0 relative rounded overflow-hidden bg-gray-200">
                      <img
                        src={upload.preview}
                        alt={`Vorschau ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removePendingUpload(index)}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                        title="Bild entfernen"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Title and Description Inputs */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Titel (optional)
                        </label>
                        <input
                          type="text"
                          value={upload.title}
                          onChange={(e) => updatePendingTitle(index, e.target.value)}
                          placeholder="z.B. Moderne Küche mit Panoramablick"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Beschreibung (optional)
                        </label>
                        <textarea
                          value={upload.description}
                          onChange={(e) => updatePendingDescription(index, e.target.value)}
                          placeholder="z.B. Kühlschrank, Kaffeemaschine, Mikrowelle, Toaster..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                          rows={2}
                        />
                      </div>
                      <p className="text-xs text-gray-400">
                        {upload.file.name} ({(upload.file.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    </div>
                  </div>
                ))}

                {pendingUploads.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Keine Bilder ausgewählt
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
              <button
                onClick={() => {
                  const input = fileInputRefs.current[uploadRoomId]
                  if (input) input.click()
                }}
                className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
              >
                + Weitere Bilder hinzufügen
              </button>
              <div className="flex gap-3">
                <button
                  onClick={cancelUploadModal}
                  className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleConfirmUpload}
                  disabled={pendingUploads.length === 0}
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {pendingUploads.length} {pendingUploads.length === 1 ? 'Bild' : 'Bilder'} hochladen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}