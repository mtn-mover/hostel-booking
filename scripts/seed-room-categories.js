const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🏠 Creating default room categories...')

  const defaultCategories = [
    { 
      name: 'living_area', 
      nameEn: 'Living Area', 
      nameDe: 'Wohnbereich', 
      order: 1, 
      isDefault: true,
      icon: 'Sofa'
    },
    { 
      name: 'dining_room', 
      nameEn: 'Dining Room', 
      nameDe: 'Esszimmer', 
      order: 2, 
      isDefault: true,
      icon: 'Utensils'
    },
    { 
      name: 'bedroom_1', 
      nameEn: 'Bedroom 1', 
      nameDe: 'Schlafzimmer 1', 
      order: 3, 
      isDefault: true,
      icon: 'Bed'
    },
    { 
      name: 'bedroom_2', 
      nameEn: 'Bedroom 2', 
      nameDe: 'Schlafzimmer 2', 
      order: 4, 
      isDefault: true,
      icon: 'Bed'
    },
    { 
      name: 'bedroom_3', 
      nameEn: 'Bedroom 3', 
      nameDe: 'Schlafzimmer 3', 
      order: 5, 
      isDefault: true,
      icon: 'Bed'
    },
    { 
      name: 'bathroom', 
      nameEn: 'Bathroom', 
      nameDe: 'Badezimmer', 
      order: 6, 
      isDefault: true,
      icon: 'Bath'
    },
    { 
      name: 'bathroom_2', 
      nameEn: 'Bathroom 2', 
      nameDe: 'Badezimmer 2', 
      order: 7, 
      isDefault: true,
      icon: 'Bath'
    },
    { 
      name: 'kitchen', 
      nameEn: 'Kitchen', 
      nameDe: 'Küche', 
      order: 8, 
      isDefault: true,
      icon: 'ChefHat'
    },
    { 
      name: 'outdoor_area', 
      nameEn: 'Outdoor Area', 
      nameDe: 'Aussenbereich', 
      order: 9, 
      isDefault: true,
      icon: 'Trees'
    },
    { 
      name: 'laundry', 
      nameEn: 'Laundry Area', 
      nameDe: 'Waschbereich', 
      order: 10, 
      isDefault: true,
      icon: 'Shirt'
    },
    { 
      name: 'view', 
      nameEn: 'View', 
      nameDe: 'Ausblick', 
      order: 11, 
      isDefault: true,
      icon: 'Mountain'
    }
  ]

  for (const category of defaultCategories) {
    try {
      const existing = await prisma.roomCategory.findUnique({
        where: { name: category.name }
      })

      if (!existing) {
        await prisma.roomCategory.create({
          data: category
        })
        console.log(`✅ Created category: ${category.nameEn} / ${category.nameDe}`)
      } else {
        console.log(`⚠️ Category already exists: ${category.nameEn}`)
      }
    } catch (error) {
      console.error(`❌ Error creating category ${category.name}:`, error.message)
    }
  }

  console.log('\n📋 All room categories:')
  const allCategories = await prisma.roomCategory.findMany({
    orderBy: { order: 'asc' }
  })

  allCategories.forEach(cat => {
    console.log(`  ${cat.order}. ${cat.nameEn} / ${cat.nameDe} ${cat.isDefault ? '(default)' : '(custom)'}`)
  })
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })