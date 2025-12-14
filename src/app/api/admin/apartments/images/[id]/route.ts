import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

interface Props {
  params: Promise<{
    id: string
  }>
}

// Update image (e.g., alt text/description)
export async function PATCH(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()

    // Update the image
    const updatedImage = await prisma.apartmentImage.update({
      where: { id },
      data: {
        alt: data.alt !== undefined ? data.alt : undefined,
        order: data.order !== undefined ? data.order : undefined,
        roomId: data.roomId !== undefined ? data.roomId : undefined,
      }
    })

    return NextResponse.json(updatedImage)
  } catch (error) {
    console.error('Update image error:', error)
    return NextResponse.json(
      { error: 'Failed to update image' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get image to delete
    const image = await prisma.apartmentImage.findUnique({
      where: { id }
    })

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      )
    }

    // Delete from database
    await prisma.apartmentImage.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    )
  }
}