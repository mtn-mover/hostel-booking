'use client'

export function TestHero() {
  return (
    <div className="relative h-96 w-full">
      {/* Direct image without any overlay */}
      <img 
        src="/images/Sites/Jungfrau.jpg"
        alt="Jungfrau"
        className="w-full h-full object-cover"
      />
      <div className="absolute top-4 left-4 bg-white p-2 rounded text-black">
        Test: Image should be visible
      </div>
    </div>
  )
}