import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// One-time fix: Set isMain=true for the first image of each apartment that has no main image
// This endpoint temporarily has no auth for the one-time fix
// Supports both GET and POST for easy browser access
async function fixMainImages() {
  // Find all apartments that have images but no main image
  const apartmentsWithImages = await prisma.apartment.findMany({
    include: {
      apartmentImages: {
        orderBy: { order: 'asc' }
      }
    }
  })

  let fixedCount = 0

  for (const apartment of apartmentsWithImages) {
    if (apartment.apartmentImages.length === 0) continue

    // Check if any image is marked as main
    const hasMainImage = apartment.apartmentImages.some(img => img.isMain)

    if (!hasMainImage) {
      // Set the first image as main
      const firstImage = apartment.apartmentImages[0]
      await prisma.apartmentImage.update({
        where: { id: firstImage.id },
        data: { isMain: true }
      })
      fixedCount++
    }
  }

  return {
    success: true,
    message: `Fixed ${fixedCount} apartments with missing main images`,
    fixedCount
  }
}

export async function GET() {
  try {
    const result = await fixMainImages()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Fix main images error:', error)
    return NextResponse.json(
      { error: 'Failed to fix main images' },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    const result = await fixMainImages()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Fix main images error:', error)
    return NextResponse.json(
      { error: 'Failed to fix main images' },
      { status: 500 }
    )
  }
}
