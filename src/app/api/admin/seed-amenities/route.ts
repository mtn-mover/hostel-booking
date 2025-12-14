import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Comprehensive Airbnb-style amenities (no icons - just clean text)
const amenitiesData = [
  // Scenic Views
  { name: 'Mountain view', category: 'Scenic Views' },
  { name: 'Lake view', category: 'Scenic Views' },
  { name: 'City view', category: 'Scenic Views' },
  { name: 'Garden view', category: 'Scenic Views' },

  // Bathroom
  { name: 'Hair dryer', category: 'Bathroom' },
  { name: 'Shampoo', category: 'Bathroom' },
  { name: 'Body wash', category: 'Bathroom' },
  { name: 'Hot water', category: 'Bathroom' },
  { name: 'Shower', category: 'Bathroom' },
  { name: 'Bathtub', category: 'Bathroom' },
  { name: 'Cleaning products', category: 'Bathroom' },
  { name: 'Towels', category: 'Bathroom' },

  // Bedroom & Laundry
  { name: 'Washer', category: 'Bedroom & Laundry' },
  { name: 'Dryer', category: 'Bedroom & Laundry' },
  { name: 'Essentials', category: 'Bedroom & Laundry' },
  { name: 'Bed linens', category: 'Bedroom & Laundry' },
  { name: 'Extra pillows and blankets', category: 'Bedroom & Laundry' },
  { name: 'Hangers', category: 'Bedroom & Laundry' },
  { name: 'Iron', category: 'Bedroom & Laundry' },
  { name: 'Drying rack', category: 'Bedroom & Laundry' },
  { name: 'Blackout curtains', category: 'Bedroom & Laundry' },
  { name: 'Clothing storage', category: 'Bedroom & Laundry' },

  // Entertainment
  { name: 'TV', category: 'Entertainment' },
  { name: 'Smart TV', category: 'Entertainment' },
  { name: 'Cable TV', category: 'Entertainment' },
  { name: 'Sound system', category: 'Entertainment' },
  { name: 'Books and reading material', category: 'Entertainment' },
  { name: 'Board games', category: 'Entertainment' },

  // Family
  { name: 'Crib', category: 'Family' },
  { name: 'Travel crib', category: 'Family' },
  { name: 'High chair', category: 'Family' },
  { name: 'Children toys', category: 'Family' },
  { name: 'Baby safety gates', category: 'Family' },
  { name: 'Baby bath', category: 'Family' },

  // Heating & Cooling
  { name: 'Air conditioning', category: 'Heating & Cooling' },
  { name: 'Central heating', category: 'Heating & Cooling' },
  { name: 'Portable fan', category: 'Heating & Cooling' },
  { name: 'Fireplace', category: 'Heating & Cooling' },

  // Home Safety
  { name: 'Smoke alarm', category: 'Home Safety' },
  { name: 'Carbon monoxide alarm', category: 'Home Safety' },
  { name: 'Fire extinguisher', category: 'Home Safety' },
  { name: 'First aid kit', category: 'Home Safety' },
  { name: 'Security cameras', category: 'Home Safety' },
  { name: 'Safe', category: 'Home Safety' },

  // Internet & Office
  { name: 'WiFi', category: 'Internet & Office' },
  { name: 'Dedicated workspace', category: 'Internet & Office' },
  { name: 'Printer', category: 'Internet & Office' },

  // Kitchen & Dining
  { name: 'Kitchen', category: 'Kitchen & Dining' },
  { name: 'Refrigerator', category: 'Kitchen & Dining' },
  { name: 'Mini fridge', category: 'Kitchen & Dining' },
  { name: 'Microwave', category: 'Kitchen & Dining' },
  { name: 'Oven', category: 'Kitchen & Dining' },
  { name: 'Stove', category: 'Kitchen & Dining' },
  { name: 'Dishwasher', category: 'Kitchen & Dining' },
  { name: 'Coffee maker', category: 'Kitchen & Dining' },
  { name: 'Kettle', category: 'Kitchen & Dining' },
  { name: 'Toaster', category: 'Kitchen & Dining' },
  { name: 'Cooking basics', category: 'Kitchen & Dining' },
  { name: 'Dishes and silverware', category: 'Kitchen & Dining' },
  { name: 'Wine glasses', category: 'Kitchen & Dining' },
  { name: 'Dining table', category: 'Kitchen & Dining' },
  { name: 'Rice cooker', category: 'Kitchen & Dining' },
  { name: 'Baking sheet', category: 'Kitchen & Dining' },

  // Location Features
  { name: 'Private entrance', category: 'Location Features' },
  { name: 'Ground floor access', category: 'Location Features' },

  // Outdoor
  { name: 'Balcony', category: 'Outdoor' },
  { name: 'Patio', category: 'Outdoor' },
  { name: 'Terrace', category: 'Outdoor' },
  { name: 'Garden', category: 'Outdoor' },
  { name: 'Private courtyard', category: 'Outdoor' },
  { name: 'Outdoor furniture', category: 'Outdoor' },
  { name: 'BBQ grill', category: 'Outdoor' },
  { name: 'Pool', category: 'Outdoor' },

  // Parking & Access
  { name: 'Free parking', category: 'Parking & Access' },
  { name: 'Paid parking', category: 'Parking & Access' },
  { name: 'Garage', category: 'Parking & Access' },
  { name: 'Elevator', category: 'Parking & Access' },
  { name: 'Single level home', category: 'Parking & Access' },

  // Services
  { name: 'Self check-in', category: 'Services' },
  { name: 'Keypad', category: 'Services' },
  { name: 'Lockbox', category: 'Services' },
  { name: 'Luggage storage', category: 'Services' },
  { name: 'Long term stays allowed', category: 'Services' },

  // Pets
  { name: 'Pets allowed', category: 'Pets' },
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
            icon: null,
          }
        })
        updated++
      } else {
        await prisma.amenity.create({
          data: {
            name: amenity.name,
            category: amenity.category,
            icon: null,
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
              icon: null,
            }
          })
          updated++
        } else {
          await prisma.amenity.create({
            data: {
              name: amenity.name,
              category: amenity.category,
              icon: null,
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
