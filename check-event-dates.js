require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkEventDates() {
  try {
    const events = await prisma.eventPrice.findMany({
      where: { isActive: true },
      orderBy: { startDate: 'asc' }
    });
    
    console.log('\n=== Event Prices in Database ===');
    events.forEach(e => {
      console.log(`\nEvent: ${e.eventName}`);
      console.log(`  Start Date: ${e.startDate}`);
      console.log(`  End Date: ${e.endDate}`);
      console.log(`  Price: ${e.price} CHF`);
      console.log(`  Apartment ID: ${e.apartmentId}`);
      
      // Check what dates this should apply to
      const startDate = new Date(e.startDate);
      const endDate = new Date(e.endDate);
      
      console.log('\n  Should apply to these dates:');
      const current = new Date(startDate);
      while (current <= endDate) {
        const dateStr = current.toISOString().split('T')[0];
        const shouldApply = dateStr >= e.startDate && dateStr < e.endDate; // < not <=
        console.log(`    ${dateStr}: ${shouldApply ? 'YES' : 'NO (checkout)'}`);
        current.setDate(current.getDate() + 1);
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEventDates();