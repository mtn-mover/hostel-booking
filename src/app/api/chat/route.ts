import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { PrismaClient } from '@prisma/client';
import { hostelKnowledgeBase } from '@/lib/knowledge-base';
import LearningSystem from '@/lib/learning-system';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const prisma = new PrismaClient();
const learningSystem = LearningSystem.getInstance();

// Confidence threshold for escalation
const CONFIDENCE_THRESHOLD = 0.85;
const ESCALATION_KEYWORDS = ['human', 'person', 'mitarbeiter', 'help', 'hilfe', 'speak to', 'sprechen mit'];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { 
      message, 
      sessionId, 
      language = 'en',
      chatHistory = [],
      isAdminResponse = false,
      adminUserId = null 
    } = await request.json();

    // Get or create chat session
    let chatSession = await prisma.chatSession.findUnique({
      where: { sessionId }
    });

    if (!chatSession) {
      chatSession = await prisma.chatSession.create({
        data: {
          sessionId,
          userId: session?.user?.id || null,
          guestName: session?.user?.name || 'Guest',
          language
        }
      });
    }

    // Store the message
    await prisma.chatMessage.create({
      data: {
        sessionId: chatSession.id,  // Use the ChatSession's ID, not the sessionId string
        role: isAdminResponse ? 'admin' : 'user',
        content: message,
        timestamp: new Date()
      }
    });

    // If this is an admin response, trigger learning
    if (isAdminResponse && adminUserId) {
      const lastUserMessage = await prisma.chatMessage.findFirst({
        where: {
          sessionId: chatSession.id,
          role: 'user'
        },
        orderBy: { timestamp: 'desc' }
      });

      const lastAssistantMessage = await prisma.chatMessage.findFirst({
        where: {
          sessionId: chatSession.id,
          role: 'assistant'
        },
        orderBy: { timestamp: 'desc' }
      });

      if (lastUserMessage) {
        await learningSystem.analyzeAdminResponse({
          sessionId: sessionId,  // This is the string sessionId for learning system
          originalQuestion: lastUserMessage.content,
          claudeResponse: lastAssistantMessage?.content,
          claudeConfidence: lastAssistantMessage?.confidence || 0,
          adminResponse: message
        });
      }

      return NextResponse.json({ 
        message: 'Admin response recorded and learning initiated',
        learned: true 
      });
    }

    // Check if user is explicitly requesting human assistance
    const wantsHuman = ESCALATION_KEYWORDS.some(keyword => 
      message.toLowerCase().includes(keyword)
    );

    if (wantsHuman) {
      await escalateToAdmin(chatSession.id, message, 'User requested human assistance');
      
      return NextResponse.json({
        response: language === 'de' 
          ? "Ich hole sofort einen Mitarbeiter für Sie. Einen Moment bitte..." 
          : "I'm getting a team member to help you right away. One moment please...",
        escalated: true,
        confidence: 0
      });
    }

    // Get relevant learned knowledge
    const learnedKnowledge = await learningSystem.getRelevantKnowledge(message);

    // Build enhanced system prompt with knowledge base and learned knowledge
    const systemPrompt = await buildSystemPrompt(language, learnedKnowledge);

    // Get Claude's response
    const claudeMessage = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      temperature: 0.3, // Lower temperature for more consistent responses
      system: systemPrompt,
      messages: [
        ...chatHistory.map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        { role: 'user', content: message }
      ]
    });

    const responseContent = claudeMessage.content[0].type === 'text' 
      ? claudeMessage.content[0].text 
      : '';

    // Calculate confidence based on response
    const confidence = await calculateConfidence(message, responseContent, learnedKnowledge);

    // Store assistant message
    await prisma.chatMessage.create({
      data: {
        sessionId: chatSession.id,  // Use the ChatSession's ID, not the sessionId string
        role: 'assistant',
        content: responseContent,
        confidence,
        timestamp: new Date()
      }
    });

    // Check if we need to escalate
    if (confidence < CONFIDENCE_THRESHOLD) {
      await escalateToAdmin(
        chatSession.id, 
        message, 
        `Low confidence response (${(confidence * 100).toFixed(1)}%)`
      );

      // Add escalation notice to response
      const escalationNotice = language === 'de'
        ? "\n\n_[Hinweis: Ein Mitarbeiter wurde informiert und wird sich gleich bei Ihnen melden.]_"
        : "\n\n_[Note: A team member has been notified and will assist you shortly.]_";

      return NextResponse.json({
        response: responseContent + escalationNotice,
        escalated: true,
        confidence
      });
    }

    return NextResponse.json({
      response: responseContent,
      escalated: false,
      confidence
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}

/**
 * Build system prompt with knowledge base and learned knowledge
 */
async function buildSystemPrompt(language: string, learnedKnowledge: any[]): Promise<string> {
  // Get ALL Q&A pairs from database to use as context
  const prisma = new PrismaClient();
  const allQAPairs = await prisma.learnedKnowledge.findMany({
    where: {
      question: { not: null },
      answer: { not: null }
    }
  });
  
  // Format Q&A pairs for context
  const qaContext = allQAPairs.map(qa => ({
    question: qa.question,
    answer: qa.answer,
    category: qa.category
  }));
  
  const basePrompt = language === 'de' ? `
Du bist der freundliche Gäste-Support für Heart of Interlaken Apartments in Interlaken, Schweiz.
Wir haben 5 Apartments: Heart 1, Heart 2, Heart 3, Heart 4 und Heart 5.

WICHTIG - Verwende diese spezifischen Informationen und Policies für deine Antworten:
${qaContext.length > 0 ? `
=== GELERNTE INFORMATIONEN UND POLICIES ===
${qaContext.map((qa, idx) => `
${idx + 1}. Thema: ${qa.category}
   Wenn gefragt: "${qa.question}"
   Antworte: "${qa.answer}"
`).join('')}
=== ENDE DER GELERNTEN INFORMATIONEN ===
` : ''}

Grundlegende Hostel-Informationen:
${JSON.stringify(hostelKnowledgeBase, null, 2)}

KRITISCHE ANWEISUNGEN (HÖCHSTE PRIORITÄT):
1. Die GELERNTEN INFORMATIONEN oben haben ABSOLUTE PRIORITÄT über die grundlegenden Hostel-Informationen
2. Wenn es eine gelernte Information zu einem Thema gibt, verwende NUR diese - ignoriere widersprüchliche Basis-Informationen
3. Beispiel: Wenn gelernt wurde "keine Late Check-in Gebühr", dann sage NIEMALS es gibt eine Gebühr, egal was in den Basis-Informationen steht
4. Erkenne semantisch ähnliche Fragen intelligent:
   - "spätes Einchecken" = "spät ankommen" = "nach 20 Uhr" = "nachts ankommen" = "verspätete Ankunft"
   - "Gebühren" = "Kosten" = "Aufpreis" = "extra bezahlen" = "Zusatzkosten"
5. Gib KONSISTENTE Antworten - keine Widersprüche!
6. Halte Antworten kurz und klar (max 2-3 Sätze)
7. Sei freundlich und professionell
8. Wenn unsicher: "Ich bin mir nicht ganz sicher. Lass mich das für Sie mit einem Kollegen klären."
9. Erwähne NIE dass du ein AI/Bot bist
` : `
You are the friendly guest support for Heart of Interlaken Apartments in Interlaken, Switzerland.
We have 5 apartments: Heart 1, Heart 2, Heart 3, Heart 4 and Heart 5.

IMPORTANT - Use these specific information and policies for your responses:
${qaContext.length > 0 ? `
=== LEARNED INFORMATION AND POLICIES ===
${qaContext.map((qa, idx) => `
${idx + 1}. Topic: ${qa.category}
   When asked: "${qa.question}"
   Answer: "${qa.answer}"
`).join('')}
=== END OF LEARNED INFORMATION ===
` : ''}

Basic hostel information:
${JSON.stringify(hostelKnowledgeBase, null, 2)}

CRITICAL INSTRUCTIONS (HIGHEST PRIORITY):
1. LEARNED INFORMATION above has ABSOLUTE PRIORITY over basic hostel information
2. If there's learned information on a topic, use ONLY that - ignore contradictory base information
3. Example: If learned "no late check-in fee", NEVER say there's a fee, regardless of base information
4. Intelligently recognize semantically similar questions:
   - "late check-in" = "arrive late" = "after 8pm" = "arrive at night" = "delayed arrival"
   - "fees" = "costs" = "surcharge" = "extra payment" = "additional costs"
5. Give CONSISTENT answers - no contradictions!
6. Keep answers short and clear (max 2-3 sentences)
7. Be friendly and professional
8. If unsure: "I'm not entirely sure. Let me clarify this with a colleague for you."
9. NEVER mention that you're an AI/bot
`;

  return basePrompt;
}

/**
 * Calculate confidence score for a response
 */
async function calculateConfidence(
  question: string,
  response: string,
  learnedKnowledge: any[]
): Promise<number> {
  let confidence = 0.88; // Start with higher base confidence since we have a knowledge base

  // If we have a direct Q&A match, use very high confidence
  const hasDirectMatch = learnedKnowledge.some(k => k.isDirectMatch);
  if (hasDirectMatch) {
    return 0.98; // Very high confidence for predefined Q&A pairs
  }

  // If we have high-confidence learned knowledge, boost confidence
  if (learnedKnowledge.length > 0) {
    const avgLearnedConfidence = learnedKnowledge.reduce((sum, k) => sum + k.confidence, 0) / learnedKnowledge.length;
    confidence = Math.max(confidence, avgLearnedConfidence);
  }

  // Check if response contains uncertainty phrases
  const uncertaintyPhrases = [
    "i'm not sure",
    "ich bin nicht sicher",
    "perhaps",
    "vielleicht",
    "might be",
    "könnte sein",
    "i think",
    "ich denke",
    "i believe",
    "ich glaube"
  ];

  const hasUncertainty = uncertaintyPhrases.some(phrase => 
    response.toLowerCase().includes(phrase)
  );

  if (hasUncertainty) {
    confidence *= 0.7;  // Drop below threshold if uncertain
  }

  // Check if response is very short (might indicate lack of information)
  if (response.length < 30) {
    confidence *= 0.85;
  }

  // Check if response contains specific facts (prices, times, etc.)
  const factPatterns = [
    /\d+:\d+/, // Times
    /CHF\s*\d+/, // Prices
    /\d+\s*(minute|hour|day|meter|km|uhr|minuten|stunden|tage)/i, // Distances/durations
    /\+\d+\s*\d+/, // Phone numbers
    /@/, // Email addresses
  ];

  const hasFacts = factPatterns.some(pattern => pattern.test(response));
  if (hasFacts) {
    confidence = Math.min(confidence * 1.05, 0.95); // Boost but cap at 95%
  }

  // Common questions about basic info should have high confidence
  const commonTopics = [
    'check-in', 'check-out', 'wifi', 'wlan', 'password', 'passwort',
    'parking', 'parken', 'parkplatz', 'breakfast', 'frühstück',
    'address', 'adresse', 'location', 'standort'
  ];

  const isCommonTopic = commonTopics.some(topic => 
    question.toLowerCase().includes(topic) || response.toLowerCase().includes(topic)
  );

  if (isCommonTopic && !hasUncertainty) {
    confidence = Math.max(confidence, 0.9);
  }

  return Math.min(Math.max(confidence, 0), 1);
}

/**
 * Escalate chat to admin
 */
async function escalateToAdmin(
  chatSessionId: string,
  message: string,
  reason: string
): Promise<void> {
  // Update chat session as escalated
  await prisma.chatSession.update({
    where: { id: chatSessionId },
    data: { escalated: true }
  });

  // Create admin notification
  await prisma.adminNotification.create({
    data: {
      chatSessionId,
      title: 'Chat Escalation Required',
      message: `Guest needs assistance: "${message.slice(0, 100)}${message.length > 100 ? '...' : ''}"`,
      urgency: determineUrgency(message),
      createdAt: new Date()
    }
  });

  // TODO: Send push notification to admin mobile app
  // This will be implemented when we create the React Native app
}

/**
 * Determine urgency level of escalation
 */
function determineUrgency(message: string): string {
  const highUrgencyKeywords = ['emergency', 'notfall', 'urgent', 'dringend', 'immediately', 'sofort'];
  const mediumUrgencyKeywords = ['problem', 'issue', 'broken', 'kaputt', 'not working', 'funktioniert nicht'];

  const messageLower = message.toLowerCase();

  if (highUrgencyKeywords.some(keyword => messageLower.includes(keyword))) {
    return 'high';
  }

  if (mediumUrgencyKeywords.some(keyword => messageLower.includes(keyword))) {
    return 'medium';
  }

  return 'low';
}

// GET endpoint to retrieve chat history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { timestamp: 'asc' }
    });

    return NextResponse.json({ messages });

  } catch (error) {
    console.error('Chat history error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve chat history' },
      { status: 500 }
    );
  }
}