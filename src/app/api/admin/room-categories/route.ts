import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.roomCategory.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch room categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name, nameEn, nameDe, icon } = await request.json()

    if (!name || !nameEn || !nameDe) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get highest order number
    const lastCategory = await prisma.roomCategory.findFirst({
      orderBy: { order: 'desc' }
    })

    const newOrder = (lastCategory?.order || 0) + 1

    const category = await prisma.roomCategory.create({
      data: {
        name,
        nameEn,
        nameDe,
        icon,
        order: newOrder,
        isDefault: false,
        isActive: true
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Create category error:', error)
    return NextResponse.json(
      { error: 'Failed to create room category' },
      { status: 500 }
    )
  }
}