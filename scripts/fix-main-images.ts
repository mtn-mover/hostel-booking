import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

async function fixMainImages() {
  console.log('Fixing main images...')

  // Find all apartments that have images
  const apartmentsWithImages = await prisma.apartment.findMany({
    include: {
      apartmentImages: {
        orderBy: { order: 'asc' }
      }
    }
  })

  let fixedCount = 0

  for (const apartment of apartmentsWithImages) {
    if (apartment.apartmentImages.length === 0) {
      console.log(`Apartment ${apartment.id} (${apartment.title || apartment.name}): No images`)
      continue
    }

    // Check if any image is marked as main
    const hasMainImage = apartment.apartmentImages.some(img => img.isMain)

    if (!hasMainImage) {
      // Set the first image as main
      const firstImage = apartment.apartmentImages[0]
      await prisma.apartmentImage.update({
        where: { id: firstImage.id },
        data: { isMain: true }
      })
      console.log(`Fixed: Apartment ${apartment.id} (${apartment.title || apartment.name}) - Set image ${firstImage.id} as main`)
      fixedCount++
    } else {
      console.log(`OK: Apartment ${apartment.id} (${apartment.title || apartment.name}) - Already has main image`)
    }
  }

  console.log(`\nDone! Fixed ${fixedCount} apartments with missing main images.`)
}

fixMainImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
