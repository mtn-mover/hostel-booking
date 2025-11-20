require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPrices() {
  try {
    const apts = await prisma.apartment.findMany({
      where: { isActive: true },
      include: {
        seasonPrices: {
          where: { isActive: true },
          orderBy: { startDate: 'asc' }
        },
        eventPrices: {
          where: { isActive: true },
          orderBy: { startDate: 'asc' }
        },
        discountRules: {
          where: { isActive: true },
          orderBy: { minNights: 'asc' }
        }
      }
    });
    
    apts.forEach(apt => {
      console.log('\n========================================');
      console.log('Apartment:', apt.title);
      console.log('Base Price:', apt.price, 'CHF');
      
      console.log('\n=== Season Prices ===');
      if (apt.seasonPrices.length > 0) {
        apt.seasonPrices.forEach(s => {
          console.log(`  ${s.name} (${s.type}): ${s.price} CHF`);
          console.log(`    Period: ${s.startDate} to ${s.endDate}`);
          console.log(`    Priority: ${s.priority}`);
        });
      } else {
        console.log('  No season prices defined');
      }
      
      console.log('\n=== Event Prices ===');
      if (apt.eventPrices.length > 0) {
        apt.eventPrices.forEach(e => {
          console.log(`  ${e.eventName}: ${e.price} CHF`);
          console.log(`    Period: ${e.startDate} to ${e.endDate}`);
        });
      } else {
        console.log('  No event prices defined');
      }
      
      console.log('\n=== Discount Rules ===');
      if (apt.discountRules.length > 0) {
        apt.discountRules.forEach(d => {
          console.log(`  ${d.minNights}+ nights: ${d.percentage}% discount`);
        });
      } else {
        console.log('  No discount rules defined');
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPrices();