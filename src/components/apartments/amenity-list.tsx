'use client'

import { useState } from 'react'

interface AmenityListProps {
  amenities: string[]
}

const iconMap: { [key: string]: string } = {
  // Views & Location
  'Mountain view': '🏔️',
  'Garden view': '🌿', 
  'Courtyard view': '🏡',
  'Scenic views': '🌄',
  'Private entrance': '🚪',
  'Central location': '📍',
  'Single level home': '🏠',
  
  // Kitchen & Dining
  'Kitchen': '🍳',
  'Refrigerator': '❄️', 
  'Cooking basics': '🥄',
  'Dishes and silverware': '🍽️',
  'Freezer': '🧊',
  'Dishwasher': '🧽',
  'Electric stove': '🔥',
  'Oven': '⚡',
  'Kettle': '☕',
  'Coffee maker': '☕',
  'Coffee': '☕',
  'Wine glasses': '🍷',
  'Toaster': '🍞',
  'Baking sheet': '🥧',
  'Blender': '🥤',
  'Rice cooker': '🍚',
  'Dining table': '🪑',
  
  // Bathroom
  'Hair dryer': '💨',
  'Cleaning products': '🧼',
  'Shampoo': '🧴',
  'Soap': '🧼',
  'Hot water': '🚿',
  'Shower gel': '🧴',
  
  // Bedroom & Linens
  'Essentials': '🛏️',
  'Towels': '🛁',
  'Bed linens': '🛏️',
  'Cotton bed sheets': '🛏️',
  'Hangers': '👔',
  'Iron': '👔',
  'Blackout blinds': '🌙',
  'Dresser': '👗',
  
  // Entertainment & Tech
  'TV': '📺',
  'WiFi': '📶',
  
  // Climate
  'Portable fans': '🌪️',
  'Central heating': '🔥',
  
  // Safety & Services
  'First aid kit': '🏥',
  'Long term stays allowed': '📅',
  'Self check-in': '🔐',
  'Lockbox': '🗝️',
  
  // Outdoor & Parking
  'Garden furniture': '🪑',
  'Outdoor dining area': '🍽️',
  'Paid parking off premises': '🚗',
  'Laundromat nearby': '🧺'
}

// Categorize amenities
const categorizeAmenities = (amenities: string[]) => {
  const categories: { [key: string]: string[] } = {
    'Aussicht & Lage': [],
    'Küche & Esszimmer': [], 
    'Badezimmer': [],
    'Schlafzimmer & Bettwäsche': [],
    'Unterhaltung & Internet': [],
    'Heizung & Klimaanlage': [],
    'Sicherheit & Services': [],
    'Außenbereich & Parken': []
  }

  amenities.forEach(amenity => {
    if (['Mountain view', 'Garden view', 'Courtyard view', 'Scenic views', 'Private entrance', 'Central location', 'Single level home'].includes(amenity)) {
      categories['Aussicht & Lage'].push(amenity)
    } else if (['Kitchen', 'Refrigerator', 'Cooking basics', 'Dishes and silverware', 'Freezer', 'Dishwasher', 'Electric stove', 'Oven', 'Kettle', 'Coffee maker', 'Coffee', 'Wine glasses', 'Toaster', 'Baking sheet', 'Blender', 'Rice cooker', 'Dining table'].includes(amenity)) {
      categories['Küche & Esszimmer'].push(amenity)
    } else if (['Hair dryer', 'Cleaning products', 'Shampoo', 'Soap', 'Hot water', 'Shower gel'].includes(amenity)) {
      categories['Badezimmer'].push(amenity)
    } else if (['Essentials', 'Towels', 'Bed linens', 'Cotton bed sheets', 'Hangers', 'Iron', 'Blackout blinds', 'Dresser'].includes(amenity)) {
      categories['Schlafzimmer & Bettwäsche'].push(amenity)
    } else if (['TV', 'WiFi'].includes(amenity)) {
      categories['Unterhaltung & Internet'].push(amenity)
    } else if (['Portable fans', 'Central heating'].includes(amenity)) {
      categories['Heizung & Klimaanlage'].push(amenity)
    } else if (['First aid kit', 'Long term stays allowed', 'Self check-in', 'Lockbox'].includes(amenity)) {
      categories['Sicherheit & Services'].push(amenity)
    } else if (['Garden furniture', 'Outdoor dining area', 'Paid parking off premises', 'Laundromat nearby'].includes(amenity)) {
      categories['Außenbereich & Parken'].push(amenity)
    }
  })

  return categories
}

export function AmenityList({ amenities }: AmenityListProps) {
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({})

  if (amenities.length === 0) {
    return (
      <p className="text-gray-500 italic">No amenities listed</p>
    )
  }

  const categories = categorizeAmenities(amenities)
  
  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }))
  }

  return (
    <div className="space-y-4">
      {Object.entries(categories).map(([categoryName, categoryAmenities]) => {
        if (categoryAmenities.length === 0) return null
        
        const isExpanded = expandedCategories[categoryName]
        
        return (
          <div key={categoryName} className="border border-gray-200 rounded-lg">
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(categoryName)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {categoryName}
                </h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {categoryAmenities.length}
                </span>
              </div>
              <svg 
                className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Category Content */}
            {isExpanded && (
              <div className="px-4 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categoryAmenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-xl">
                        {iconMap[amenity] || '✨'}
                      </span>
                      <div className="font-medium text-gray-700">
                        {amenity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}