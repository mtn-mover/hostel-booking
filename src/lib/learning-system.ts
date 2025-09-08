import { PrismaClient } from '@prisma/client';
import { hostelKnowledgeBase, KnowledgeCategory } from './knowledge-base';

const prisma = new PrismaClient();

export interface LearningContext {
  sessionId: string;
  originalQuestion: string;
  claudeResponse?: string;
  claudeConfidence?: number;
  adminResponse: string;
  guestSatisfaction?: number;
}

export interface ExtractedKnowledge {
  category: KnowledgeCategory;
  facts: Record<string, any>;
  patterns: string[];
  confidence: number;
}

export class LearningSystem {
  private static instance: LearningSystem;
  
  private constructor() {}
  
  static getInstance(): LearningSystem {
    if (!LearningSystem.instance) {
      LearningSystem.instance = new LearningSystem();
    }
    return LearningSystem.instance;
  }
  
  /**
   * Analyze an admin response and extract learnable information
   */
  async analyzeAdminResponse(context: LearningContext): Promise<ExtractedKnowledge> {
    const { originalQuestion, adminResponse } = context;
    
    // Extract potential facts from the admin response
    const extracted = this.extractFactsFromResponse(originalQuestion, adminResponse);
    
    // Determine the category based on keywords
    const category = this.categorizeKnowledge(originalQuestion, adminResponse);
    
    // Extract patterns for future matching
    const patterns = this.extractPatterns(originalQuestion);
    
    // Calculate confidence based on guest satisfaction and response clarity
    const confidence = this.calculateConfidence(context);
    
    // Store the learning in the database
    await this.storeLearning(context, {
      category,
      facts: extracted,
      patterns,
      confidence
    });
    
    return {
      category,
      facts: extracted,
      patterns,
      confidence
    };
  }
  
  /**
   * Extract facts from admin response
   */
  private extractFactsFromResponse(question: string, response: string): Record<string, any> {
    const facts: Record<string, any> = {};
    
    // Extract times (e.g., "15:00", "3PM")
    const timePattern = /\b(\d{1,2}):?(\d{2})?\s*(uhr|am|pm)?\b/gi;
    const times = response.match(timePattern);
    if (times) {
      facts.times = times;
    }
    
    // Extract prices (e.g., "CHF 20", "€50")
    const pricePattern = /\b(chf|eur|€|fr\.?)\s*(\d+(?:\.\d{2})?)\b/gi;
    const prices = response.match(pricePattern);
    if (prices) {
      facts.prices = prices;
    }
    
    // Extract percentages (e.g., "10%", "50% discount")
    const percentPattern = /\b(\d+)\s*%/gi;
    const percentages = response.match(percentPattern);
    if (percentages) {
      facts.percentages = percentages;
    }
    
    // Extract durations (e.g., "5 minutes", "2 hours")
    const durationPattern = /\b(\d+)\s*(minute|hour|day|week|month|minuten|stunde|tag|woche|monat)/gi;
    const durations = response.match(durationPattern);
    if (durations) {
      facts.durations = durations;
    }
    
    // Extract contact info (phone, email)
    const phonePattern = /\+?[\d\s\-\(\)]+/g;
    const emailPattern = /[\w\.-]+@[\w\.-]+\.\w+/g;
    const phones = response.match(phonePattern);
    const emails = response.match(emailPattern);
    if (phones) facts.phones = phones;
    if (emails) facts.emails = emails;
    
    // Extract locations/addresses
    const addressKeywords = /(street|strasse|road|avenue|platz|weg)/gi;
    if (addressKeywords.test(response)) {
      facts.hasAddress = true;
    }
    
    // Store the full response for context
    facts.fullResponse = response;
    facts.questionContext = question;
    
    return facts;
  }
  
  /**
   * Categorize knowledge based on keywords
   */
  private categorizeKnowledge(question: string, response: string): KnowledgeCategory {
    const text = `${question} ${response}`.toLowerCase();
    
    const categoryKeywords: Record<KnowledgeCategory, string[]> = {
      checkin: ['check-in', 'checkin', 'arrival', 'ankunft', 'key', 'schlüssel'],
      checkout: ['check-out', 'checkout', 'departure', 'abreise', 'leave'],
      wifi: ['wifi', 'internet', 'wlan', 'password', 'passwort', 'network'],
      apartments: ['apartment', 'room', 'zimmer', 'suite', 'bed', 'bett'],
      location: ['direction', 'address', 'adresse', 'where', 'wo', 'map'],
      recommendations: ['restaurant', 'eat', 'essen', 'activity', 'aktivität', 'shop'],
      policies: ['rule', 'policy', 'regel', 'allowed', 'erlaubt', 'smoking', 'pet'],
      amenities: ['facility', 'amenity', 'ausstattung', 'kitchen', 'küche', 'laundry'],
      transport: ['train', 'zug', 'bus', 'car', 'auto', 'parking', 'airport'],
      emergency: ['emergency', 'notfall', 'doctor', 'arzt', 'hospital', 'help'],
      seasonal: ['summer', 'winter', 'sommer', 'season', 'weather', 'wetter'],
      booking: ['book', 'buchen', 'reservation', 'reservierung', 'available'],
      payment: ['pay', 'zahlen', 'credit card', 'price', 'preis', 'cost'],
      covid: ['covid', 'corona', 'mask', 'maske', 'cleaning', 'reinigung'],
      general: ['hostel', 'contact', 'kontakt', 'info', 'general'],
      custom: []
    };
    
    let bestMatch: KnowledgeCategory = 'custom';
    let maxMatches = 0;
    
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      const matches = keywords.filter(keyword => text.includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = category as KnowledgeCategory;
      }
    }
    
    return bestMatch;
  }
  
  /**
   * Calculate semantic similarity between two questions
   */
  private calculateSimilarity(q1: string, q2: string): number {
    // Normalize questions
    const normalize = (text: string) => text.toLowerCase()
      .replace(/[.,!?;:]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    const norm1 = normalize(q1);
    const norm2 = normalize(q2);
    
    // Exact match
    if (norm1 === norm2) return 1.0;
    
    // Define semantic equivalents and synonyms
    const synonymGroups = [
      ['checkin', 'check-in', 'einchecken', 'ankommen', 'anreise', 'arrival', 'ankunft'],
      ['checkout', 'check-out', 'auschecken', 'abreise', 'departure', 'verlassen'],
      ['spät', 'später', 'verspätet', 'late', 'verzögert', 'nachts', 'abends'],
      ['früh', 'früher', 'morgens', 'early', 'vormittags'],
      ['wann', 'um welche zeit', 'um wieviel uhr', 'what time', 'when'],
      ['bis wann', 'bis welche zeit', 'until when', 'how late'],
      ['können wir', 'kann ich', 'ist es möglich', 'geht es', 'dürfen wir', 'is it possible', 'can we', 'may we'],
      ['problem', 'schwierigkeit', 'issue', 'trouble'],
      ['schlüssel', 'key', 'keys', 'türcode', 'code'],
      ['wifi', 'wlan', 'internet', 'wifi passwort', 'wlan passwort', 'password'],
      ['parken', 'parking', 'parkplatz', 'car', 'auto'],
      ['preis', 'kosten', 'price', 'cost', 'gebühr', 'fee'],
      ['reisen', 'ankommen', 'arrive', 'kommen', 'erreichen']
    ];
    
    // Replace synonyms with canonical form
    let processed1 = norm1;
    let processed2 = norm2;
    
    for (const group of synonymGroups) {
      const canonical = group[0];
      for (const synonym of group) {
        const regex = new RegExp(`\\b${synonym}\\b`, 'gi');
        processed1 = processed1.replace(regex, canonical);
        processed2 = processed2.replace(regex, canonical);
      }
    }
    
    // Token-based similarity
    const tokens1 = processed1.split(' ');
    const tokens2 = processed2.split(' ');
    
    // Calculate Jaccard similarity
    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    const jaccardSimilarity = intersection.size / union.size;
    
    // Check for key concept matches
    const keyConceptBonus = this.checkKeyConceptMatch(norm1, norm2);
    
    // Calculate final similarity score
    let finalScore = jaccardSimilarity * 0.7 + keyConceptBonus * 0.3;
    
    // Boost score for substring matches
    if (norm1.includes(norm2) || norm2.includes(norm1)) {
      finalScore = Math.max(finalScore, 0.8);
    }
    
    return Math.min(finalScore, 1.0);
  }
  
  /**
   * Check if questions share key concepts
   */
  private checkKeyConceptMatch(q1: string, q2: string): number {
    const concepts = [
      { keywords: ['checkin', 'einchecken', 'ankunft', 'ankommen'], weight: 1.0 },
      { keywords: ['spät', 'später', 'abends', 'nachts', 'verspätet'], weight: 1.0 },
      { keywords: ['früh', 'früher', 'morgens'], weight: 1.0 },
      { keywords: ['wann', 'zeit', 'uhr'], weight: 0.8 },
      { keywords: ['schlüssel', 'key', 'code'], weight: 0.9 },
      { keywords: ['wifi', 'wlan', 'internet'], weight: 1.0 },
      { keywords: ['parken', 'parking', 'auto'], weight: 1.0 }
    ];
    
    let maxScore = 0;
    
    for (const concept of concepts) {
      const hasInQ1 = concept.keywords.some(k => q1.includes(k));
      const hasInQ2 = concept.keywords.some(k => q2.includes(k));
      
      if (hasInQ1 && hasInQ2) {
        maxScore = Math.max(maxScore, concept.weight);
      }
    }
    
    return maxScore;
  }
  
  /**
   * Extract patterns for future question matching
   */
  private extractPatterns(question: string): string[] {
    const patterns: string[] = [];
    const cleanQuestion = question.toLowerCase().trim();
    
    // Full question as a pattern
    patterns.push(cleanQuestion);
    
    // Key phrases (3-5 word combinations)
    const words = cleanQuestion.split(/\s+/);
    for (let i = 0; i <= words.length - 3; i++) {
      patterns.push(words.slice(i, i + 3).join(' '));
    }
    
    // Question type patterns
    const questionTypes = [
      { pattern: /^(what|was)\s+/, type: 'what' },
      { pattern: /^(when|wann)\s+/, type: 'when' },
      { pattern: /^(where|wo)\s+/, type: 'where' },
      { pattern: /^(how|wie)\s+/, type: 'how' },
      { pattern: /^(can|kann|könnte)\s+/, type: 'can' },
      { pattern: /^(is|ist)\s+/, type: 'is' }
    ];
    
    for (const { pattern, type } of questionTypes) {
      if (pattern.test(cleanQuestion)) {
        patterns.push(`${type}_question`);
        break;
      }
    }
    
    return [...new Set(patterns)]; // Remove duplicates
  }
  
  /**
   * Calculate confidence score for learned knowledge
   */
  private calculateConfidence(context: LearningContext): number {
    let confidence = 0.5; // Base confidence
    
    // Guest satisfaction heavily influences confidence
    if (context.guestSatisfaction) {
      confidence = context.guestSatisfaction / 5;
    }
    
    // If Claude had low confidence, the admin response is very valuable
    if (context.claudeConfidence && context.claudeConfidence < 0.5) {
      confidence += 0.2;
    }
    
    // Longer, detailed admin responses are more reliable
    if (context.adminResponse.length > 100) {
      confidence += 0.1;
    }
    
    // Cap at 0.95 (never 100% certain)
    return Math.min(confidence, 0.95);
  }
  
  /**
   * Store learning in the database
   */
  private async storeLearning(
    context: LearningContext,
    extracted: ExtractedKnowledge
  ): Promise<void> {
    try {
      // Store the chat learning record
      await prisma.chatLearning.create({
        data: {
          sessionId: context.sessionId,
          originalQuestion: context.originalQuestion,
          claudeResponse: context.claudeResponse,
          claudeConfidence: context.claudeConfidence,
          adminResponse: context.adminResponse,
          guestSatisfaction: context.guestSatisfaction,
          learningExtracted: JSON.stringify(extracted),
          appliedToKnowledge: false
        }
      });
      
      // Check if we should update or create learned knowledge
      const keyName = `${extracted.category}_${Date.now()}`;
      
      const existingKnowledge = await prisma.learnedKnowledge.findFirst({
        where: {
          category: extracted.category,
          content: {
            contains: context.originalQuestion.slice(0, 50)
          }
        }
      });
      
      if (existingKnowledge) {
        // Update existing knowledge
        await prisma.learnedKnowledge.update({
          where: { id: existingKnowledge.id },
          data: {
            content: JSON.stringify({
              ...JSON.parse(existingKnowledge.content),
              ...extracted.facts
            }),
            confidence: Math.max(existingKnowledge.confidence, extracted.confidence),
            learnedFromChats: JSON.stringify([
              ...JSON.parse(existingKnowledge.learnedFromChats),
              context.sessionId
            ])
          }
        });
      } else {
        // Create new learned knowledge
        const knowledge = await prisma.learnedKnowledge.create({
          data: {
            category: extracted.category,
            keyName,
            content: JSON.stringify(extracted.facts),
            confidence: extracted.confidence,
            learnedFromChats: JSON.stringify([context.sessionId])
          }
        });
        
        // Add patterns for this knowledge
        for (const pattern of extracted.patterns) {
          await prisma.knowledgePattern.create({
            data: {
              knowledgeId: knowledge.id,
              pattern,
              patternType: pattern.includes('_question') ? 'semantic' : 'exact',
              confidence: extracted.confidence
            }
          });
        }
      }
    } catch (error) {
      console.error('Error storing learning:', error);
    }
  }
  
  /**
   * Get relevant learned knowledge for a question
   */
  async getRelevantKnowledge(question: string): Promise<any[]> {
    const cleanQuestion = question.toLowerCase().trim();
    const results = [];
    
    // First, get ALL Q&A pairs to do manual matching (SQLite limitations)
    const allQAPairs = await prisma.learnedKnowledge.findMany({
      where: {
        question: { not: null }
      }
    });
    
    console.log(`Searching for Q&A match for: "${question}"`);
    console.log(`Found ${allQAPairs.length} total Q&A pairs in database`);
    
    // Calculate similarity scores for all Q&A pairs
    const scoredMatches = allQAPairs.map(qa => {
      if (!qa.question) return null;
      const score = this.calculateSimilarity(cleanQuestion, qa.question.toLowerCase());
      return { ...qa, similarityScore: score };
    }).filter(item => item !== null && item.similarityScore > 0.3) // Minimum 30% similarity
      .sort((a, b) => b!.similarityScore - a!.similarityScore);
    
    // Get top matches
    const directMatches = scoredMatches.slice(0, 3);
    
    console.log(`Found ${directMatches.length} matching Q&A pairs with similarity scores:`,
      directMatches.map(m => ({ question: m.question?.substring(0, 50), score: m.similarityScore })));
    
    // Add direct Q&A matches with high priority
    for (const match of directMatches) {
      if (match.question && match.answer) {
        // Adjust confidence based on similarity score
        const adjustedConfidence = match.similarityScore > 0.9 ? 0.98 : 
                                   match.similarityScore > 0.7 ? 0.9 :
                                   match.similarityScore > 0.5 ? 0.8 : 0.7;
        results.push({
          question: match.question,
          answer: match.answer,
          confidence: adjustedConfidence,
          category: match.category,
          isDirectMatch: match.similarityScore > 0.8, // Only high similarity is "direct"
          similarityScore: match.similarityScore
        });
      }
    }
    
    // Then find matching patterns
    const patterns = await prisma.knowledgePattern.findMany({
      where: {
        OR: [
          { pattern: { contains: cleanQuestion } },
          { pattern: { in: this.extractPatterns(question) } }
        ]
      },
      include: {
        knowledge: true
      },
      orderBy: {
        confidence: 'desc'
      },
      take: 5
    });
    
    // Update hit counts
    for (const pattern of patterns) {
      await prisma.knowledgePattern.update({
        where: { id: pattern.id },
        data: {
          hitCount: { increment: 1 },
          lastMatched: new Date()
        }
      });
    }
    
    // Add pattern matches
    for (const p of patterns) {
      results.push({
        ...JSON.parse(p.knowledge.content),
        confidence: p.knowledge.confidence,  // Changed from confidenceScore to confidence
        category: p.knowledge.category,
        isDirectMatch: false
      });
    }
    
    // Sort by confidence and return
    return results.sort((a, b) => b.confidence - a.confidence);
  }
  
  /**
   * Update knowledge success rate based on feedback
   */
  async updateKnowledgeSuccess(
    knowledgeId: string,
    wasSuccessful: boolean
  ): Promise<void> {
    const knowledge = await prisma.learnedKnowledge.findUnique({
      where: { id: knowledgeId }
    });
    
    if (knowledge) {
      const currentRate = knowledge.successRate;
      const useCount = knowledge.useCount;
      
      // Calculate new success rate (weighted average)
      const newRate = (currentRate * useCount + (wasSuccessful ? 1 : 0)) / (useCount + 1);
      
      await prisma.learnedKnowledge.update({
        where: { id: knowledgeId },
        data: {
          successRate: newRate,
          useCount: { increment: 1 },
          lastUsed: new Date()
        }
      });
    }
  }
  
  /**
   * Get learning analytics
   */
  async getLearningAnalytics() {
    const totalLearnings = await prisma.chatLearning.count();
    const appliedLearnings = await prisma.chatLearning.count({
      where: { appliedToKnowledge: true }
    });
    
    const knowledgeByCategory = await prisma.learnedKnowledge.groupBy({
      by: ['category'],
      _count: true,
      _avg: {
        confidence: true,
        successRate: true
      }
    });
    
    const recentLearnings = await prisma.chatLearning.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        session: {
          include: {
            messages: {
              take: 1,
              orderBy: { timestamp: 'desc' }
            }
          }
        }
      }
    });
    
    const highConfidenceKnowledge = await prisma.learnedKnowledge.findMany({
      where: { confidence: { gte: 0.8 } },
      orderBy: { useCount: 'desc' },
      take: 10
    });
    
    return {
      totalLearnings,
      appliedLearnings,
      applicationRate: totalLearnings > 0 ? (appliedLearnings / totalLearnings) * 100 : 0,
      knowledgeByCategory,
      recentLearnings,
      highConfidenceKnowledge
    };
  }
}

export default LearningSystem;