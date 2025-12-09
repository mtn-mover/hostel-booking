import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Comprehensive Airbnb-style amenities
const amenitiesData = [
  // Scenic Views
  { name: 'Mountain view', category: 'Scenic Views', icon: 'Mountain' },
  { name: 'Lake view', category: 'Scenic Views', icon: 'Waves' },
  { name: 'City view', category: 'Scenic Views', icon: 'Building' },
  { name: 'Garden view', category: 'Scenic Views', icon: 'TreePine' },

  // Bathroom
  { name: 'Hair dryer', category: 'Bathroom', icon: 'Wind' },
  { name: 'Shampoo', category: 'Bathroom', icon: 'Droplets' },
  { name: 'Body wash', category: 'Bathroom', icon: 'Droplets' },
  { name: 'Hot water', category: 'Bathroom', icon: 'ShowerHead' },
  { name: 'Shower', category: 'Bathroom', icon: 'ShowerHead' },
  { name: 'Bathtub', category: 'Bathroom', icon: 'Bath' },
  { name: 'Cleaning products', category: 'Bathroom', icon: 'Sparkles' },
  { name: 'Towels', category: 'Bathroom', icon: 'Shirt' },

  // Bedroom & Laundry
  { name: 'Washer', category: 'Bedroom & Laundry', icon: 'WashingMachine' },
  { name: 'Dryer', category: 'Bedroom & Laundry', icon: 'Wind' },
  { name: 'Essentials', category: 'Bedroom & Laundry', icon: 'Package' },
  { name: 'Bed linens', category: 'Bedroom & Laundry', icon: 'Bed' },
  { name: 'Extra pillows and blankets', category: 'Bedroom & Laundry', icon: 'Pillow' },
  { name: 'Hangers', category: 'Bedroom & Laundry', icon: 'Shirt' },
  { name: 'Iron', category: 'Bedroom & Laundry', icon: 'Iron' },
  { name: 'Drying rack', category: 'Bedroom & Laundry', icon: 'Shirt' },
  { name: 'Blackout curtains', category: 'Bedroom & Laundry', icon: 'Moon' },
  { name: 'Clothing storage', category: 'Bedroom & Laundry', icon: 'HardDrive' },

  // Entertainment
  { name: 'TV', category: 'Entertainment', icon: 'Tv' },
  { name: 'Smart TV', category: 'Entertainment', icon: 'Tv' },
  { name: 'Cable TV', category: 'Entertainment', icon: 'Tv' },
  { name: 'Sound system', category: 'Entertainment', icon: 'Speaker' },
  { name: 'Books and reading material', category: 'Entertainment', icon: 'BookOpen' },
  { name: 'Board games', category: 'Entertainment', icon: 'Gamepad2' },

  // Family
  { name: 'Crib', category: 'Family', icon: 'Baby' },
  { name: 'Travel crib', category: 'Family', icon: 'Baby' },
  { name: 'High chair', category: 'Family', icon: 'Baby' },
  { name: 'Children toys', category: 'Family', icon: 'Gamepad2' },
  { name: 'Baby safety gates', category: 'Family', icon: 'Shield' },
  { name: 'Baby bath', category: 'Family', icon: 'Baby' },

  // Heating & Cooling
  { name: 'Air conditioning', category: 'Heating & Cooling', icon: 'Snowflake' },
  { name: 'Central heating', category: 'Heating & Cooling', icon: 'Flame' },
  { name: 'Portable fan', category: 'Heating & Cooling', icon: 'Fan' },
  { name: 'Fireplace', category: 'Heating & Cooling', icon: 'Flame' },

  // Home Safety
  { name: 'Smoke alarm', category: 'Home Safety', icon: 'Shield' },
  { name: 'Carbon monoxide alarm', category: 'Home Safety', icon: 'AlertTriangle' },
  { name: 'Fire extinguisher', category: 'Home Safety', icon: 'FirstAid' },
  { name: 'First aid kit', category: 'Home Safety', icon: 'FirstAid' },
  { name: 'Security cameras', category: 'Home Safety', icon: 'Camera' },
  { name: 'Safe', category: 'Home Safety', icon: 'Lock' },

  // Internet & Office
  { name: 'WiFi', category: 'Internet & Office', icon: 'Wifi' },
  { name: 'Dedicated workspace', category: 'Internet & Office', icon: 'Laptop' },
  { name: 'Printer', category: 'Internet & Office', icon: 'Printer' },

  // Kitchen & Dining
  { name: 'Kitchen', category: 'Kitchen & Dining', icon: 'UtensilsCrossed' },
  { name: 'Refrigerator', category: 'Kitchen & Dining', icon: 'Refrigerator' },
  { name: 'Mini fridge', category: 'Kitchen & Dining', icon: 'Refrigerator' },
  { name: 'Microwave', category: 'Kitchen & Dining', icon: 'Microwave' },
  { name: 'Oven', category: 'Kitchen & Dining', icon: 'Flame' },
  { name: 'Stove', category: 'Kitchen & Dining', icon: 'Flame' },
  { name: 'Dishwasher', category: 'Kitchen & Dining', icon: 'Sparkles' },
  { name: 'Coffee maker', category: 'Kitchen & Dining', icon: 'Coffee' },
  { name: 'Kettle', category: 'Kitchen & Dining', icon: 'Zap' },
  { name: 'Toaster', category: 'Kitchen & Dining', icon: 'Sandwich' },
  { name: 'Cooking basics', category: 'Kitchen & Dining', icon: 'CookingPot' },
  { name: 'Dishes and silverware', category: 'Kitchen & Dining', icon: 'Utensils' },
  { name: 'Wine glasses', category: 'Kitchen & Dining', icon: 'Wine' },
  { name: 'Dining table', category: 'Kitchen & Dining', icon: 'Utensils' },
  { name: 'Rice cooker', category: 'Kitchen & Dining', icon: 'CookingPot' },
  { name: 'Baking sheet', category: 'Kitchen & Dining', icon: 'CookingPot' },

  // Location Features
  { name: 'Private entrance', category: 'Location Features', icon: 'DoorOpen' },
  { name: 'Ground floor access', category: 'Location Features', icon: 'Building' },

  // Outdoor
  { name: 'Balcony', category: 'Outdoor', icon: 'Sun' },
  { name: 'Patio', category: 'Outdoor', icon: 'Sun' },
  { name: 'Terrace', category: 'Outdoor', icon: 'Sun' },
  { name: 'Garden', category: 'Outdoor', icon: 'TreePine' },
  { name: 'Private courtyard', category: 'Outdoor', icon: 'TreePine' },
  { name: 'Outdoor furniture', category: 'Outdoor', icon: 'Armchair' },
  { name: 'BBQ grill', category: 'Outdoor', icon: 'Flame' },
  { name: 'Pool', category: 'Outdoor', icon: 'Waves' },

  // Parking & Access
  { name: 'Free parking', category: 'Parking & Access', icon: 'Car' },
  { name: 'Paid parking', category: 'Parking & Access', icon: 'ParkingCircle' },
  { name: 'Garage', category: 'Parking & Access', icon: 'Car' },
  { name: 'Elevator', category: 'Parking & Access', icon: 'ArrowUpDown' },
  { name: 'Single level home', category: 'Parking & Access', icon: 'Building' },

  // Services
  { name: 'Self check-in', category: 'Services', icon: 'KeyRound' },
  { name: 'Keypad', category: 'Services', icon: 'Key' },
  { name: 'Lockbox', category: 'Services', icon: 'Lock' },
  { name: 'Luggage storage', category: 'Services', icon: 'Package' },
  { name: 'Long term stays allowed', category: 'Services', icon: 'Clock' },

  // Pets
  { name: 'Pets allowed', category: 'Pets', icon: 'Dog' },
]

export async function POST() {
  try {
    let created = 0
    let updated = 0

    for (const amenity of amenitiesData) {
      const existing = await prisma.amenity.findUnique({
        where: { name: amenity.name }
      })

      if (existing) {
        await prisma.amenity.update({
          where: { name: amenity.name },
          data: {
            category: amenity.category,
            icon: amenity.icon,
          }
        })
        updated++
      } else {
        await prisma.amenity.create({
          data: {
            name: amenity.name,
            category: amenity.category,
            icon: amenity.icon,
          }
        })
        created++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Seeded amenities: ${created} created, ${updated} updated`,
      total: amenitiesData.length
    })
  } catch (error) {
    console.error('Error seeding amenities:', error)
    return NextResponse.json(
      { error: 'Failed to seed amenities', details: String(error) },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const seed = searchParams.get('seed')

  // If ?seed=true, run the seeding
  if (seed === 'true') {
    try {
      let created = 0
      let updated = 0

      for (const amenity of amenitiesData) {
        const existing = await prisma.amenity.findUnique({
          where: { name: amenity.name }
        })

        if (existing) {
          await prisma.amenity.update({
            where: { name: amenity.name },
            data: {
              category: amenity.category,
              icon: amenity.icon,
            }
          })
          updated++
        } else {
          await prisma.amenity.create({
            data: {
              name: amenity.name,
              category: amenity.category,
              icon: amenity.icon,
            }
          })
          created++
        }
      }

      return NextResponse.json({
        success: true,
        message: `Seeded amenities: ${created} created, ${updated} updated`,
        total: amenitiesData.length
      })
    } catch (error) {
      console.error('Error seeding amenities:', error)
      return NextResponse.json(
        { error: 'Failed to seed amenities', details: String(error) },
        { status: 500 }
      )
    }
  }

  // Default: just list existing amenities
  try {
    const amenities = await prisma.amenity.findMany({
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json({
      count: amenities.length,
      amenities,
      hint: 'Add ?seed=true to seed amenities'
    })
  } catch (error) {
    console.error('Error fetching amenities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch amenities' },
      { status: 500 }
    )
  }
}
