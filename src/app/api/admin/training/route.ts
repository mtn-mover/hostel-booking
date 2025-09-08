import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch learned knowledge from database - only Q&A pairs
    const learnedKnowledge = await prisma.learnedKnowledge.findMany({
      where: {
        question: { not: null },
        answer: { not: null }
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`Found ${learnedKnowledge.length} Q&A pairs in database`)

    // Transform to Q&A pairs format
    const qaPairs = learnedKnowledge.map(knowledge => ({
      id: knowledge.id,
      question: knowledge.question || '',
      answer: knowledge.answer || '',
      language: 'de', // Default language
      category: knowledge.category,
      confidence: knowledge.confidence
    }))

    return NextResponse.json({ qaPairs })
  } catch (error) {
    console.error('Error fetching training data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch training data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { qaPairs } = await request.json()
    
    console.log('Received Q&A pairs to save:', qaPairs)

    // Save or update Q&A pairs in the database
    for (const qa of qaPairs) {
      // Check if this ID exists in database
      const existing = qa.id ? await prisma.learnedKnowledge.findUnique({
        where: { id: qa.id }
      }) : null;
      
      if (existing) {
        // Update existing
        await prisma.learnedKnowledge.update({
          where: { id: qa.id },
          data: {
            question: qa.question,
            answer: qa.answer,
            category: qa.category,
            confidence: qa.confidence
          }
        })
      } else {
        // Create new
        console.log('Creating new Q&A:', { question: qa.question, answer: qa.answer, category: qa.category })
        const created = await prisma.learnedKnowledge.create({
          data: {
            question: qa.question,
            answer: qa.answer,
            category: qa.category,
            confidence: qa.confidence || 1.0,
            keyName: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            content: JSON.stringify({
              source: 'manual_training',
              addedBy: session.user.email,
              addedAt: new Date().toISOString()
            })
          }
        })
        console.log('Created Q&A with ID:', created.id)
      }
    }

    return NextResponse.json({ 
      success: true,
      message: `Saved ${qaPairs.length} Q&A pairs` 
    })
  } catch (error) {
    console.error('Error saving training data:', error)
    return NextResponse.json(
      { error: 'Failed to save training data' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    await prisma.learnedKnowledge.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting Q&A pair:', error)
    return NextResponse.json(
      { error: 'Failed to delete Q&A pair' },
      { status: 500 }
    )
  }
}