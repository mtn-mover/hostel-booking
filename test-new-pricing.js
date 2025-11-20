// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testPricing() {
  try {
    // Get apartment with season and event prices
    const apartment = await prisma.apartment.findFirst({
      where: { 
        isActive: true,
        title: 'Hearts 5'  // This apartment has season prices and discounts
      }
    });
    
    if (!apartment) {
      console.log('No active apartments found');
      return;
    }
    
    console.log('\n=== Testing Pricing for:', apartment.title, '===\n');
    
    // Test dates that span multiple seasons and an event
    // Sept 10-20: Summer season (600 CHF)
    // Sept 21: Event price (1500 CHF) 
    // Sept 22-25: Fall season (300 CHF)
    const checkIn = new Date('2025-09-10');
    const checkOut = new Date('2025-09-25');
    
    console.log('Check-in:', checkIn.toLocaleDateString());
    console.log('Check-out:', checkOut.toLocaleDateString());
    console.log('Base price per night:', apartment.price);
    
    // Make API call to calculate price
    const response = await fetch(`http://localhost:3000/api/apartments/${apartment.id}/calculate-price`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString()
      })
    });
    
    if (!response.ok) {
      console.error('API Error:', response.status, response.statusText);
      return;
    }
    
    const pricing = await response.json();
    
    console.log('\n=== Pricing Results ===');
    console.log('Total nights:', pricing.nights);
    console.log('Subtotal:', pricing.subtotal);
    console.log('Discount percentage:', pricing.discountPercentage + '%');
    console.log('Discount amount:', pricing.discountAmount);
    console.log('Cleaning fee:', pricing.cleaningFee);
    console.log('Service fee:', pricing.serviceFee);
    console.log('Total:', pricing.total);
    
    if (pricing.priceBreakdown) {
      console.log('\n=== Price Breakdown by Season/Event ===');
      pricing.priceBreakdown.forEach(breakdown => {
        console.log('\n' + breakdown.priceType + ' (' + breakdown.dateRange + ')');
        console.log('  Nights:', breakdown.nights);
        console.log('  Price per night:', breakdown.pricePerNight);
        console.log('  Subtotal:', breakdown.subtotal);
        if (breakdown.discountApplied && breakdown.discountAmount > 0) {
          console.log('  Discount applied:', breakdown.discountAmount);
        } else if (!breakdown.discountApplied && breakdown.priceType.includes('Test') || 
                   breakdown.priceType.includes('Christmas') || 
                   breakdown.priceType.includes('New Year') ||
                   breakdown.priceType.includes('Event')) {
          console.log('  No discount (Event pricing - full price applies)');
        }
        console.log('  Total for period:', breakdown.total);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPricing();