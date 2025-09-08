'use client'

import { useState, useEffect, useRef } from 'react'

interface SmartImageContainerProps {
  src: string
  alt?: string
  onClick?: () => void
  className?: string
}

export function SmartImageContainer({ src, alt, onClick, className = '' }: SmartImageContainerProps) {
  const [aspectRatio, setAspectRatio] = useState<number>(1)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setAspectRatio(img.width / img.height)
      setIsLoaded(true)
      setHasError(false)
    }
    img.onerror = () => {
      console.error('Failed to load image:', src.substring(0, 100))
      setHasError(true)
      setIsLoaded(true)
    }
    img.src = src
  }, [src])

  // Always use object-contain to prevent any cropping
  const getObjectFit = () => {
    // For base64 images, always use object-contain to show full image
    if (src.startsWith('data:image/')) {
      return 'object-contain'
    }
    return 'object-contain'
  }

  return (
    <div className={`relative w-full h-full bg-white overflow-hidden rounded-lg group ${className}`}>
      {hasError ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <div className="text-center p-4">
            <div className="text-gray-400 text-sm">Bild konnte nicht geladen werden</div>
          </div>
        </div>
      ) : (
        <>
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            onClick={onClick}
            className={`w-full h-full cursor-pointer ${getObjectFit()} ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ transition: 'opacity 0.3s' }}
            onError={() => setHasError(true)}
          />
          {onClick && !hasError && (
            <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all cursor-pointer" onClick={onClick} />
          )}
        </>
      )}
    </div>
  )
}