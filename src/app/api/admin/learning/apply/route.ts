import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { learningId } = await request.json();

    // Get the learning record
    const learning = await prisma.chatLearning.findUnique({
      where: { id: learningId }
    });

    if (!learning) {
      return NextResponse.json(
        { error: 'Learning not found' },
        { status: 404 }
      );
    }

    // Mark as applied
    await prisma.chatLearning.update({
      where: { id: learningId },
      data: { appliedToKnowledge: true }
    });

    // Parse the extracted knowledge
    const extracted = learning.learningExtracted 
      ? JSON.parse(learning.learningExtracted)
      : null;

    if (extracted) {
      // Create or update learned knowledge
      const keyName = `${extracted.category}_${Date.now()}`;
      
      await prisma.learnedKnowledge.create({
        data: {
          category: extracted.category,
          keyName,
          content: JSON.stringify(extracted.facts),
          confidenceScore: extracted.confidence || 0.8,
          learnedFromChats: JSON.stringify([learning.sessionId])
        }
      });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Learning applied to knowledge base' 
    });

  } catch (error) {
    console.error('Apply learning error:', error);
    return NextResponse.json(
      { error: 'Failed to apply learning' },
      { status: 500 }
    );
  }
}