const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkQAPairs() {
  try {
    console.log('Checking Q&A pairs in database...\n');
    
    const qaPairs = await prisma.learnedKnowledge.findMany({
      where: {
        question: { not: null }
      }
    });
    
    if (qaPairs.length === 0) {
      console.log('No Q&A pairs found in database.');
    } else {
      console.log(`Found ${qaPairs.length} Q&A pairs:\n`);
      qaPairs.forEach((qa, index) => {
        console.log(`${index + 1}. Question: ${qa.question}`);
        console.log(`   Answer: ${qa.answer}`);
        console.log(`   Category: ${qa.category}`);
        console.log(`   Confidence: ${qa.confidence}`);
        console.log('---');
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkQAPairs();