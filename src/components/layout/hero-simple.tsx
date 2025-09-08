'use client'

import { useRouter } from 'next/navigation'

export function HeroSimple() {
  const router = useRouter()
  
  return (
    <div className="relative h-96 w-full">
      {/* Direct image showing the top part (mountain peaks) */}
      <img 
        src="/images/Sites/Jungfrau.jpg"
        alt="Jungfrau"
        className="w-full h-full object-cover object-top"
      />
      
      {/* Light overlay */}
      <div className="absolute inset-0 bg-black/30" />
      
      {/* Content - positioned in lower half */}
      <div className="absolute inset-0 flex items-end justify-center pb-16">
        <div className="text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4 drop-shadow-2xl">
            Welcome to HOSTLOPIA
          </h1>
          <p className="text-xl mb-8 drop-shadow-lg">
            Your Premium Hostel & Apartment Booking Platform in Interlaken and its Surroundings
          </p>
        </div>
      </div>
    </div>
  )
}