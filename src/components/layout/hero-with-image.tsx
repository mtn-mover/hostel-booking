'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function HeroWithImage() {
  const router = useRouter()
  
  return (
    <div className="relative h-96 w-full overflow-hidden">
      {/* Jungfrau Background Image using standard img tag */}
      <img
        src="/images/Sites/Jungfrau.jpg"
        alt="Jungfrau Mountain View"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: 'center' }}
      />
      
      {/* Semi-transparent overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-30 z-10" />
      
      <div className="relative h-full flex items-center justify-center z-20">
        <div className="text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4 drop-shadow-2xl">
            Heart of Interlaken
          </h1>
          <p className="text-xl mb-8 drop-shadow-lg">
            Experience the Swiss Alps - Comfortable apartments with stunning Jungfrau views
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => document.getElementById('apartments')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg"
            >
              Browse Apartments
            </button>
            <button 
              onClick={() => router.push('/about')}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition backdrop-blur-sm"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}