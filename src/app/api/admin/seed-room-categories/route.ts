import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Standard room categories for vacation rentals
const roomCategoriesData = [
  { name: 'living_room', nameEn: 'Living Room', nameDe: 'Wohnzimmer', order: 1, isDefault: true, icon: 'sofa' },
  { name: 'bedroom', nameEn: 'Bedroom', nameDe: 'Schlafzimmer', order: 2, isDefault: true, icon: 'bed' },
  { name: 'kitchen', nameEn: 'Kitchen', nameDe: 'Küche', order: 3, isDefault: true, icon: 'utensils' },
  { name: 'bathroom', nameEn: 'Bathroom', nameDe: 'Badezimmer', order: 4, isDefault: true, icon: 'bath' },
  { name: 'balcony', nameEn: 'Balcony', nameDe: 'Balkon', order: 5, isDefault: true, icon: 'sun' },
  { name: 'terrace', nameEn: 'Terrace', nameDe: 'Terrasse', order: 6, isDefault: true, icon: 'umbrella' },
  { name: 'garden', nameEn: 'Garden', nameDe: 'Garten', order: 7, isDefault: true, icon: 'tree' },
  { name: 'dining_room', nameEn: 'Dining Room', nameDe: 'Esszimmer', order: 8, isDefault: true, icon: 'utensils' },
  { name: 'entrance', nameEn: 'Entrance', nameDe: 'Eingang', order: 9, isDefault: true, icon: 'door-open' },
  { name: 'hallway', nameEn: 'Hallway', nameDe: 'Flur', order: 10, isDefault: true, icon: 'arrow-right' },
  { name: 'exterior', nameEn: 'Exterior', nameDe: 'Aussenansicht', order: 11, isDefault: true, icon: 'home' },
  { name: 'view', nameEn: 'View', nameDe: 'Aussicht', order: 12, isDefault: true, icon: 'mountain' },
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const seed = searchParams.get('seed')

  // If ?seed=true, run the seeding
  if (seed === 'true') {
    try {
      let created = 0
      let updated = 0

      for (const category of roomCategoriesData) {
        const existing = await prisma.roomCategory.findUnique({
          where: { name: category.name }
        })

        if (existing) {
          await prisma.roomCategory.update({
            where: { name: category.name },
            data: {
              nameEn: category.nameEn,
              nameDe: category.nameDe,
              order: category.order,
              isDefault: category.isDefault,
              icon: category.icon,
            }
          })
          updated++
        } else {
          await prisma.roomCategory.create({
            data: {
              name: category.name,
              nameEn: category.nameEn,
              nameDe: category.nameDe,
              order: category.order,
              isDefault: category.isDefault,
              icon: category.icon,
            }
          })
          created++
        }
      }

      return NextResponse.json({
        success: true,
        message: `Seeded room categories: ${created} created, ${updated} updated`,
        total: roomCategoriesData.length
      })
    } catch (error) {
      console.error('Error seeding room categories:', error)
      return NextResponse.json(
        { error: 'Failed to seed room categories', details: String(error) },
        { status: 500 }
      )
    }
  }

  // Default: just list existing room categories
  try {
    const categories = await prisma.roomCategory.findMany({
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({
      count: categories.length,
      categories,
      hint: 'Add ?seed=true to seed room categories'
    })
  } catch (error) {
    console.error('Error fetching room categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch room categories' },
      { status: 500 }
    )
  }
}
