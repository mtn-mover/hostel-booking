import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

// One-time fix: Set isMain=true for the first image of each apartment that has no main image
export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

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

    return NextResponse.json({
      success: true,
      message: `Fixed ${fixedCount} apartments with missing main images`,
      fixedCount
    })
  } catch (error) {
    console.error('Fix main images error:', error)
    return NextResponse.json(
      { error: 'Failed to fix main images' },
      { status: 500 }
    )
  }
}
