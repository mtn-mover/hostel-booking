import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Standard room categories for vacation rentals (German)
const roomCategoriesData = [
  { name: 'living_room', nameEn: 'Living Room', nameDe: 'Wohnzimmer', order: 1, isDefault: true },
  { name: 'bedroom', nameEn: 'Bedroom', nameDe: 'Schlafzimmer', order: 2, isDefault: true },
  { name: 'kitchen', nameEn: 'Kitchen', nameDe: 'Küche', order: 3, isDefault: true },
  { name: 'bathroom', nameEn: 'Bathroom', nameDe: 'Badezimmer', order: 4, isDefault: true },
  { name: 'dining_room', nameEn: 'Dining Room', nameDe: 'Esszimmer', order: 5, isDefault: true },
  { name: 'balcony', nameEn: 'Balcony', nameDe: 'Balkon', order: 6, isDefault: true },
  { name: 'terrace', nameEn: 'Terrace', nameDe: 'Terrasse', order: 7, isDefault: true },
  { name: 'garden', nameEn: 'Garden', nameDe: 'Garten', order: 8, isDefault: true },
  { name: 'entrance', nameEn: 'Entrance', nameDe: 'Eingang', order: 9, isDefault: true },
  { name: 'hallway', nameEn: 'Hallway', nameDe: 'Flur', order: 10, isDefault: true },
  { name: 'exterior', nameEn: 'Exterior View', nameDe: 'Aussenansicht', order: 11, isDefault: true },
  { name: 'view', nameEn: 'View', nameDe: 'Aussicht', order: 12, isDefault: true },
  { name: 'parking', nameEn: 'Parking', nameDe: 'Parkplatz', order: 13, isDefault: true },
  { name: 'office', nameEn: 'Office/Workspace', nameDe: 'Büro/Arbeitsplatz', order: 14, isDefault: true },
  { name: 'storage', nameEn: 'Storage', nameDe: 'Abstellraum', order: 15, isDefault: true },
]

async function main() {
  console.log('🌱 Seeding room categories...')

  // Clear existing room categories (optional - comment out if you want to keep existing ones)
  // await prisma.roomCategory.deleteMany()

  // Insert room categories using upsert to avoid duplicates
  for (const category of roomCategoriesData) {
    await prisma.roomCategory.upsert({
      where: { name: category.name },
      update: {
        nameEn: category.nameEn,
        nameDe: category.nameDe,
        order: category.order,
        isDefault: category.isDefault,
        isActive: true,
      },
      create: {
        name: category.name,
        nameEn: category.nameEn,
        nameDe: category.nameDe,
        order: category.order,
        isDefault: category.isDefault,
        isActive: true,
      }
    })
    console.log(`✅ Created/updated room category: ${category.nameDe} (${category.nameEn})`)
  }

  console.log(`\n✨ Successfully seeded ${roomCategoriesData.length} room categories!`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding room categories:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
