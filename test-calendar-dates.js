require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCalendarDates() {
  try {
    const apartment = await prisma.apartment.findFirst({
      where: { 
        isActive: true,
        title: 'Hearts 5'
      }
    });
    
    if (!apartment) {
      console.log('Apartment not found');
      return;
    }
    
    // Test specific dates around the event
    const testDates = [
      '2025-09-20', // Before event
      '2025-09-21', // Event start (should show event price)
      '2025-09-22', // Event end (should NOT show event price)
      '2025-09-23'  // After event
    ];
    
    console.log('\n=== Testing Calendar Date Logic ===\n');
    console.log('Event: Test Event from 2025-09-21 to 2025-09-22 (1500 CHF)');
    console.log('Expected: 21st shows event price, 22nd does NOT\n');
    
    // Get season and event prices
    const [seasonPrices, eventPrices] = await Promise.all([
      prisma.seasonPrice.findMany({
        where: {
          apartmentId: apartment.id,
          isActive: true,
          endDate: { gte: '2025-09-20' }
        },
        orderBy: { priority: 'desc' }
      }),
      prisma.eventPrice.findMany({
        where: {
          apartmentId: apartment.id,
          isActive: true
        }
      })
    ]);
    
    for (const dateStr of testDates) {
      let calculatedPrice = apartment.price;
      let priceSource = 'Base Price';
      
      // Check for event price (end date EXCLUSIVE)
      const eventPrice = eventPrices.find(ep => 
        dateStr >= ep.startDate && dateStr < ep.endDate
      );
      
      if (eventPrice) {
        calculatedPrice = eventPrice.price;
        priceSource = `EVENT: ${eventPrice.eventName}`;
      } else {
        // Check for season price (end date EXCLUSIVE)
        const seasonPrice = seasonPrices.find(sp => 
          dateStr >= sp.startDate && dateStr < sp.endDate
        );
        
        if (seasonPrice) {
          calculatedPrice = seasonPrice.price;
          priceSource = `SEASON: ${seasonPrice.name}`;
        }
      }
      
      console.log(`Date: ${dateStr}`);
      console.log(`  Price: ${calculatedPrice} CHF`);
      console.log(`  Source: ${priceSource}`);
      console.log(`  Correct: ${
        (dateStr === '2025-09-21' && calculatedPrice === 1500) ? '✓ YES' : 
        (dateStr === '2025-09-22' && calculatedPrice !== 1500) ? '✓ YES' : 
        (dateStr === '2025-09-21' && calculatedPrice !== 1500) ? '✗ NO - Should be 1500' :
        (dateStr === '2025-09-22' && calculatedPrice === 1500) ? '✗ NO - Should NOT be 1500' :
        '...'
      }\n`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCalendarDates();