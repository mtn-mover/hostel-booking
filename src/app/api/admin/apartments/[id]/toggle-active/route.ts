import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

interface Props {
  params: {
    id: string
  }
}

export async function PATCH(request: NextRequest, { params }: Props) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { isActive } = await request.json()

    const updatedApartment = await prisma.apartment.update({
      where: { id: params.id },
      data: { isActive }
    })

    return NextResponse.json(updatedApartment)
  } catch (error) {
    console.error('Toggle active error:', error)
    return NextResponse.json(
      { error: 'Failed to toggle apartment status' },
      { status: 500 }
    )
  }
}