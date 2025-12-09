'use client'

import { useState } from 'react'
import {
  Wifi,
  Car,
  UtensilsCrossed,
  Tv,
  Wind,
  Snowflake,
  WashingMachine,
  Dumbbell,
  Waves,
  Coffee,
  Refrigerator,
  Microwave,
  Bath,
  ShowerHead,
  BedDouble,
  Sofa,
  Mountain,
  TreePine,
  Dog,
  Baby,
  Cigarette,
  Lock,
  Shield,
  Flame,
  FirstAid,
  DoorOpen,
  Laptop,
  Printer,
  Iron,
  HardDrive,
  Speaker,
  Gamepad2,
  Bike,
  Umbrella,
  Sun,
  Check,
  LucideIcon
} from 'lucide-react'
import { AmenitiesModal } from './AmenitiesModal'

// Amenity icon mapping
const amenityIcons: Record<string, LucideIcon> = {
  'wifi': Wifi,
  'free wifi': Wifi,
  'parking': Car,
  'free parking': Car,
  'kitchen': UtensilsCrossed,
  'full kitchen': UtensilsCrossed,
  'tv': Tv,
  'smart tv': Tv,
  'cable tv': Tv,
  'air conditioning': Snowflake,
  'ac': Snowflake,
  'heating': Flame,
  'washer': WashingMachine,
  'washing machine': WashingMachine,
  'dryer': Wind,
  'gym': Dumbbell,
  'fitness': Dumbbell,
  'pool': Waves,
  'swimming pool': Waves,
  'coffee': Coffee,
  'coffee maker': Coffee,
  'espresso': Coffee,
  'refrigerator': Refrigerator,
  'fridge': Refrigerator,
  'microwave': Microwave,
  'bathtub': Bath,
  'bath': Bath,
  'shower': ShowerHead,
  'hot water': ShowerHead,
  'bedroom': BedDouble,
  'bed linens': BedDouble,
  'living room': Sofa,
  'mountain view': Mountain,
  'view': Mountain,
  'garden': TreePine,
  'balcony': Sun,
  'terrace': Sun,
  'patio': Sun,
  'pets allowed': Dog,
  'pet friendly': Dog,
  'baby': Baby,
  'crib': Baby,
  'high chair': Baby,
  'smoking allowed': Cigarette,
  'safe': Lock,
  'security': Shield,
  'smoke alarm': Shield,
  'fire extinguisher': FirstAid,
  'first aid': FirstAid,
  'private entrance': DoorOpen,
  'workspace': Laptop,
  'dedicated workspace': Laptop,
  'printer': Printer,
  'iron': Iron,
  'hairdryer': Wind,
  'hair dryer': Wind,
  'storage': HardDrive,
  'sound system': Speaker,
  'games': Gamepad2,
  'bike': Bike,
  'bicycles': Bike,
  'umbrella': Umbrella,
}

// Amenity categories
const amenityCategories: Record<string, string[]> = {
  'Bathroom': ['bathtub', 'bath', 'shower', 'hot water', 'hairdryer', 'hair dryer', 'towels'],
  'Bedroom & Laundry': ['bed linens', 'washer', 'washing machine', 'dryer', 'iron', 'hangers', 'storage'],
  'Entertainment': ['tv', 'smart tv', 'cable tv', 'sound system', 'games', 'wifi', 'free wifi'],
  'Kitchen': ['kitchen', 'full kitchen', 'refrigerator', 'fridge', 'microwave', 'coffee', 'coffee maker', 'espresso', 'dishwasher'],
  'Heating & Cooling': ['heating', 'air conditioning', 'ac', 'fireplace'],
  'Outdoor': ['balcony', 'terrace', 'patio', 'garden', 'mountain view', 'view', 'pool', 'swimming pool'],
  'Parking': ['parking', 'free parking', 'garage'],
  'Safety': ['smoke alarm', 'fire extinguisher', 'first aid', 'security', 'safe', 'lock'],
  'Services': ['workspace', 'dedicated workspace', 'printer', 'gym', 'fitness'],
  'Family': ['baby', 'crib', 'high chair', 'pets allowed', 'pet friendly'],
}

function getIconForAmenity(amenity: string): LucideIcon {
  const lowerAmenity = amenity.toLowerCase()

  // Direct match
  if (amenityIcons[lowerAmenity]) {
    return amenityIcons[lowerAmenity]
  }

  // Partial match
  for (const [key, icon] of Object.entries(amenityIcons)) {
    if (lowerAmenity.includes(key) || key.includes(lowerAmenity)) {
      return icon
    }
  }

  return Check // Default icon
}

function getCategoryForAmenity(amenity: string): string {
  const lowerAmenity = amenity.toLowerCase()

  for (const [category, items] of Object.entries(amenityCategories)) {
    for (const item of items) {
      if (lowerAmenity.includes(item) || item.includes(lowerAmenity)) {
        return category
      }
    }
  }

  return 'Other'
}

interface AmenitiesSectionProps {
  amenities: string[]
}

export function AmenitiesSection({ amenities }: AmenitiesSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const INITIAL_DISPLAY = 10
  const displayedAmenities = amenities.slice(0, INITIAL_DISPLAY)
  const hasMore = amenities.length > INITIAL_DISPLAY

  // Group amenities by category for modal
  const groupedAmenities = amenities.reduce((acc, amenity) => {
    const category = getCategoryForAmenity(amenity)
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(amenity)
    return acc
  }, {} as Record<string, string[]>)

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-2xl font-semibold mb-6">What this place offers</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedAmenities.map((amenity, index) => {
          const Icon = getIconForAmenity(amenity)
          return (
            <div key={index} className="flex items-center gap-4 py-2">
              <Icon className="w-6 h-6 text-gray-700 flex-shrink-0" />
              <span className="text-gray-700">{amenity}</span>
            </div>
          )
        })}
      </div>

      {hasMore && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-6 w-full md:w-auto px-6 py-3 border border-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          Show all {amenities.length} amenities
        </button>
      )}

      <AmenitiesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        groupedAmenities={groupedAmenities}
        getIcon={getIconForAmenity}
      />
    </div>
  )
}
