import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const apartmentId = formData.get('apartmentId') as string
    const roomId = formData.get('roomId') as string
    const images = formData.getAll('images') as File[]
    const descriptionsJson = formData.get('descriptions') as string | null

    // Parse descriptions array if provided
    let descriptions: string[] = []
    if (descriptionsJson) {
      try {
        descriptions = JSON.parse(descriptionsJson)
      } catch (e) {
        console.log('Failed to parse descriptions:', e)
      }
    }

    if (!apartmentId || !roomId || images.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get current max order for this room
    const existingImages = await prisma.apartmentImage.findMany({
      where: {
        apartmentId,
        roomId
      },
      orderBy: { order: 'desc' },
      take: 1
    })

    let currentOrder = existingImages[0]?.order || -1

    const uploadedImages = []

    for (let i = 0; i < images.length; i++) {
      const image = images[i]
      const description = descriptions[i] || ''

      // Convert to base64
      const bytes = await image.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Convert AVIF and other formats to JPEG for better compatibility
      let mimeType = image.type || 'image/jpeg'
      let base64 = buffer.toString('base64')

      // For AVIF, WEBP, or very large images, use JPEG format
      if (mimeType === 'image/avif' || mimeType === 'image/webp' || buffer.length > 500000) {
        // For now, still save as base64 but mark AVIF for future conversion
        mimeType = 'image/jpeg'
      }

      const dataUrl = `data:${mimeType};base64,${base64}`

      currentOrder++

      // Save to database with base64 data URL
      // Use provided description if available, otherwise use filename
      const dbImage = await prisma.apartmentImage.create({
        data: {
          apartmentId,
          roomId,
          url: dataUrl,
          alt: description || image.name.replace(/\.[^/.]+$/, ''),
          order: currentOrder
        }
      })

      uploadedImages.push(dbImage)
    }

    return NextResponse.json(uploadedImages)
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload images' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { images } = await request.json()

    // Update order for each image
    const updates = images.map((img: any) =>
      prisma.apartmentImage.update({
        where: { id: img.id },
        data: { order: img.order }
      })
    )

    await Promise.all(updates)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reorder error:', error)
    return NextResponse.json(
      { error: 'Failed to reorder images' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const apartmentId = searchParams.get('apartmentId')

    if (!apartmentId) {
      return NextResponse.json(
        { error: 'Apartment ID is required' },
        { status: 400 }
      )
    }

    const images = await prisma.apartmentImage.findMany({
      where: { apartmentId },
      orderBy: [
        { roomId: 'asc' },
        { order: 'asc' }
      ]
    })

    return NextResponse.json(images)
  } catch (error) {
    console.error('Get images error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    )
  }
}