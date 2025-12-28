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
  HeartPulse,
  DoorOpen,
  Laptop,
  Printer,
  Shirt,
  HardDrive,
  Speaker,
  Gamepad2,
  Bike,
  Umbrella,
  Sun,
  Check,
  Eye,
  Sparkles,
  Droplets,
  Bed,
  Square,
  Moon,
  Package,
  BookOpen,
  ThermometerSun,
  Fan,
  Camera,
  Building,
  CookingPot,
  Utensils,
  GlassWater,
  Zap,
  Wine,
  Sandwich,
  Salad,
  Home,
  Armchair,
  ParkingCircle,
  ArrowUpDown,
  Clock,
  Key,
  KeyRound,
  AlertTriangle,
  XCircle,
  LucideIcon
} from 'lucide-react'
import { AmenitiesModal } from './AmenitiesModal'

// Comprehensive amenity icon mapping (German & English)
const amenityIcons: Record<string, LucideIcon> = {
  // Views
  'scenic view': Eye,
  'malerischer ausblick': Eye,
  'mountain view': Mountain,
  'blick auf die berge': Mountain,
  'view': Mountain,
  'ausblick': Mountain,

  // Bathroom
  'bathroom': Bath,
  'badezimmer': Bath,
  'hair dryer': Wind,
  'hairdryer': Wind,
  'föhn': Wind,
  'foehn': Wind,
  'cleaning products': Sparkles,
  'reinigungsprodukte': Sparkles,
  'shampoo': Droplets,
  'soap': Droplets,
  'seife': Droplets,
  'body wash': Droplets,
  'duschgel': Droplets,
  'shower gel': Droplets,
  'hot water': ShowerHead,
  'warmwasser': ShowerHead,
  'shower': ShowerHead,
  'dusche': ShowerHead,
  'bathtub': Bath,
  'badewanne': Bath,

  // Bedroom & Laundry
  'washer': WashingMachine,
  'washing machine': WashingMachine,
  'waschmaschine': WashingMachine,
  'dryer': Wind,
  'trockner': Wind,
  'essentials': Package,
  'grundausstattung': Package,
  'towels': Shirt,
  'handtücher': Shirt,
  'bed linens': Bed,
  'bettwäsche': Bed,
  'linens': Bed,
  'hangers': Shirt,
  'kleiderbügel': Shirt,
  'extra pillows': Square,
  'extrakissen': Square,
  'extra blankets': Bed,
  'extradecken': Bed,
  'blackout': Moon,
  'abdunklung': Moon,
  'blackout curtains': Moon,
  'verdunkelung': Moon,
  'iron': Shirt,
  'bügeleisen': Shirt,
  'drying rack': Shirt,
  'wäscheständer': Shirt,
  'clothing storage': HardDrive,
  'aufbewahrung': HardDrive,
  'dresser': HardDrive,
  'kommode': HardDrive,
  'closet': HardDrive,
  'schrank': HardDrive,

  // Entertainment
  'tv': Tv,
  'fernseher': Tv,
  'television': Tv,
  'cable': Tv,
  'kabelanschluss': Tv,
  'smart tv': Tv,
  'wifi': Wifi,
  'wlan': Wifi,
  'internet': Wifi,
  'sound system': Speaker,
  'games': Gamepad2,
  'spiele': Gamepad2,
  'books': BookOpen,
  'bücher': BookOpen,

  // Family
  'crib': Baby,
  'babybett': Baby,
  'baby crib': Baby,
  'travel crib': Baby,
  'reisebett': Baby,
  'children toys': Gamepad2,
  'kinderspielzeug': Gamepad2,
  'kids toys': Gamepad2,
  'spielzeug': Gamepad2,
  'high chair': Baby,
  'hochstuhl': Baby,
  'baby gate': Shield,
  'sicherheitsgitter': Shield,
  'baby safety': Shield,

  // Heating & Cooling
  'air conditioning': Snowflake,
  'klimaanlage': Snowflake,
  'ac': Snowflake,
  'central ac': Snowflake,
  'portable fan': Fan,
  'ventilator': Fan,
  'fan': Fan,
  'heating': Flame,
  'heizung': Flame,

  // Safety
  'security camera': Camera,
  'überwachungskamera': Camera,
  'camera': Camera,
  'ground floor': Building,
  'erdgeschoss': Building,
  'first aid': HeartPulse,
  'erste-hilfe': HeartPulse,
  'first aid kit': HeartPulse,
  'smoke alarm': Shield,
  'rauchmelder': Shield,
  'carbon monoxide': AlertTriangle,
  'kohlenmonoxid': AlertTriangle,
  'fire extinguisher': Flame,
  'feuerlöscher': Flame,
  'safe': Lock,
  'tresor': Lock,

  // Internet & Office
  'workspace': Laptop,
  'arbeitsplatz': Laptop,
  'desk': Laptop,
  'schreibtisch': Laptop,
  'office': Laptop,
  'büro': Laptop,

  // Kitchen & Dining
  'kitchen': UtensilsCrossed,
  'küche': UtensilsCrossed,
  'refrigerator': Refrigerator,
  'kühlschrank': Refrigerator,
  'fridge': Refrigerator,
  'microwave': Microwave,
  'mikrowelle': Microwave,
  'cooking basics': CookingPot,
  'kochausstattung': CookingPot,
  'pots': CookingPot,
  'töpfe': CookingPot,
  'pans': CookingPot,
  'pfannen': CookingPot,
  'dishes': Utensils,
  'geschirr': Utensils,
  'silverware': Utensils,
  'besteck': Utensils,
  'cutlery': Utensils,
  'bowls': Utensils,
  'schüsseln': Utensils,
  'plates': Utensils,
  'teller': Utensils,
  'cups': Coffee,
  'tassen': Coffee,
  'mini fridge': Refrigerator,
  'minikühlschrank': Refrigerator,
  'dishwasher': Sparkles,
  'geschirrspülmaschine': Sparkles,
  'spülmaschine': Sparkles,
  'stove': Flame,
  'herd': Flame,
  'oven': Flame,
  'ofen': Flame,
  'backofen': Flame,
  'kettle': Zap,
  'wasserkocher': Zap,
  'coffee maker': Coffee,
  'kaffeemaschine': Coffee,
  'coffee': Coffee,
  'kaffee': Coffee,
  'wine glasses': Wine,
  'weingläser': Wine,
  'toaster': Sandwich,
  'baking sheet': CookingPot,
  'backblech': CookingPot,
  'rice cooker': CookingPot,
  'reiskocher': CookingPot,
  'dining table': Utensils,
  'esstisch': Utensils,

  // Location & Property
  'private entrance': DoorOpen,
  'privater eingang': DoorOpen,
  'eigener eingang': DoorOpen,

  // Outdoor
  'balcony': Sun,
  'balkon': Sun,
  'patio': Sun,
  'terrasse': Sun,
  'terrace': Sun,
  'courtyard': TreePine,
  'innenhof': TreePine,
  'garden': TreePine,
  'garten': TreePine,
  'outdoor furniture': Armchair,
  'gartenmöbel': Armchair,
  'pool': Waves,
  'swimming pool': Waves,

  // Parking & Access
  'elevator': ArrowUpDown,
  'aufzug': ArrowUpDown,
  'lift': ArrowUpDown,
  'parking': Car,
  'parkplatz': Car,
  'free parking': Car,
  'paid parking': ParkingCircle,
  'kostenpflichtiger parkplatz': ParkingCircle,
  'garage': Car,
  'single level': Building,
  'eine ebene': Building,
  'no stairs': Building,

  // Services
  'luggage storage': Package,
  'gepäck': Package,
  'long term': Clock,
  'langzeit': Clock,
  'self check-in': KeyRound,
  'selbst-check-in': KeyRound,
  'keypad': Key,
  'codeschloss': Key,
  'lockbox': Key,

  // Pets
  'pets allowed': Dog,
  'haustiere': Dog,
  'pet friendly': Dog,

  // Not available markers
  'not available': XCircle,
  'nicht verfügbar': XCircle,
}

// Amenity categories matching Airbnb structure
const amenityCategories: Record<string, string[]> = {
  'Scenic Views': [
    'scenic view', 'malerischer ausblick', 'mountain view', 'blick auf die berge',
    'view', 'ausblick', 'lake view', 'seeblick', 'city view', 'stadtblick'
  ],
  'Bathroom': [
    'bathroom', 'badezimmer', 'hair dryer', 'hairdryer', 'föhn', 'foehn',
    'cleaning products', 'reinigungsprodukte', 'shampoo', 'soap', 'seife',
    'body wash', 'duschgel', 'shower gel', 'hot water', 'warmwasser',
    'shower', 'dusche', 'bathtub', 'badewanne', 'towels', 'handtücher'
  ],
  'Bedroom & Laundry': [
    'washer', 'washing machine', 'waschmaschine', 'dryer', 'trockner',
    'essentials', 'grundausstattung', 'bed linens', 'bettwäsche', 'linens',
    'hangers', 'kleiderbügel', 'extra pillows', 'extrakissen', 'extra blankets',
    'extradecken', 'blackout', 'abdunklung', 'blackout curtains', 'verdunkelung',
    'iron', 'bügeleisen', 'drying rack', 'wäscheständer', 'clothing storage',
    'aufbewahrung', 'dresser', 'kommode', 'closet', 'schrank'
  ],
  'Entertainment': [
    'tv', 'fernseher', 'television', 'cable', 'kabelanschluss', 'smart tv',
    'wifi', 'wlan', 'internet', 'sound system', 'games', 'spiele',
    'books', 'bücher'
  ],
  'Family': [
    'crib', 'babybett', 'baby crib', 'travel crib', 'reisebett',
    'children toys', 'kinderspielzeug', 'kids toys', 'spielzeug',
    'high chair', 'hochstuhl', 'baby gate', 'sicherheitsgitter', 'baby safety',
    'baby', 'kinder'
  ],
  'Heating & Cooling': [
    'air conditioning', 'klimaanlage', 'ac', 'central ac',
    'portable fan', 'ventilator', 'fan', 'heating', 'heizung',
    'fireplace', 'kamin'
  ],
  'Home Safety': [
    'security camera', 'überwachungskamera', 'camera', 'ground floor',
    'erdgeschoss', 'first aid', 'erste-hilfe', 'first aid kit',
    'smoke alarm', 'rauchmelder', 'carbon monoxide', 'kohlenmonoxid',
    'fire extinguisher', 'feuerlöscher', 'safe', 'tresor'
  ],
  'Internet & Office': [
    'wifi', 'wlan', 'internet', 'workspace', 'arbeitsplatz',
    'desk', 'schreibtisch', 'office', 'büro', 'printer', 'drucker'
  ],
  'Kitchen & Dining': [
    'kitchen', 'küche', 'refrigerator', 'kühlschrank', 'fridge',
    'microwave', 'mikrowelle', 'cooking basics', 'kochausstattung',
    'pots', 'töpfe', 'pans', 'pfannen', 'dishes', 'geschirr',
    'silverware', 'besteck', 'cutlery', 'bowls', 'schüsseln',
    'plates', 'teller', 'cups', 'tassen', 'mini fridge', 'minikühlschrank',
    'dishwasher', 'geschirrspülmaschine', 'spülmaschine', 'stove', 'herd',
    'oven', 'ofen', 'backofen', 'kettle', 'wasserkocher', 'coffee maker',
    'kaffeemaschine', 'coffee', 'kaffee', 'wine glasses', 'weingläser',
    'toaster', 'baking sheet', 'backblech', 'rice cooker', 'reiskocher',
    'dining table', 'esstisch'
  ],
  'Location Features': [
    'private entrance', 'privater eingang', 'eigener eingang'
  ],
  'Outdoor': [
    'balcony', 'balkon', 'patio', 'terrasse', 'terrace', 'courtyard',
    'innenhof', 'garden', 'garten', 'outdoor furniture', 'gartenmöbel',
    'pool', 'swimming pool', 'bbq', 'grill'
  ],
  'Parking & Access': [
    'elevator', 'aufzug', 'lift', 'parking', 'parkplatz', 'free parking',
    'paid parking', 'kostenpflichtiger parkplatz', 'garage',
    'single level', 'eine ebene', 'no stairs'
  ],
  'Services': [
    'luggage storage', 'gepäck', 'long term', 'langzeit',
    'self check-in', 'selbst-check-in', 'keypad', 'codeschloss', 'lockbox'
  ],
  'Not Included': [
    'not available', 'nicht verfügbar'
  ]
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

function isNotAvailable(amenity: string): boolean {
  const lowerAmenity = amenity.toLowerCase()
  return lowerAmenity.includes('not available') ||
         lowerAmenity.includes('nicht verfügbar') ||
         lowerAmenity.includes('no ') ||
         lowerAmenity.includes('kein')
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
          const notAvailable = isNotAvailable(amenity)
          return (
            <div key={index} className={`flex items-center gap-4 py-2 ${notAvailable ? 'opacity-50' : ''}`}>
              <Icon className={`w-6 h-6 flex-shrink-0 ${notAvailable ? 'text-gray-400' : 'text-gray-700'}`} />
              <span className={`${notAvailable ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                {amenity}
              </span>
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
        isNotAvailable={isNotAvailable}
      />
    </div>
  )
}
