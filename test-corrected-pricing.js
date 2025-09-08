const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testPricing() {
  console.log('=== TESTING CORRECTED PRICING SYSTEM ===\n');
  
  const apartmentId = 'cmf4aplby000fujq0r1509971';
  
  // Test dates - let's check December pricing
  const testCases = [
    {
      checkIn: new Date('2024-12-20'),
      checkOut: new Date('2024-12-21'),
      nights: 1,
      expectedDiscount: 0,
      description: '1 Nacht im Dezember'
    },
    {
      checkIn: new Date('2024-12-20'),
      checkOut: new Date('2024-12-22'),
      nights: 2,
      expectedDiscount: 10,
      description: '2 Nächte im Dezember'
    },
    {
      checkIn: new Date('2024-12-20'),
      checkOut: new Date('2024-12-23'),
      nights: 3,
      expectedDiscount: 15,
      description: '3 Nächte im Dezember'
    },
    {
      checkIn: new Date('2024-12-20'),
      checkOut: new Date('2024-12-24'),
      nights: 4,
      expectedDiscount: 20,
      description: '4 Nächte im Dezember (sollte 20% sein, NICHT 30%!)'
    },
    {
      checkIn: new Date('2024-12-20'),
      checkOut: new Date('2024-12-25'),
      nights: 5,
      expectedDiscount: 25,
      description: '5 Nächte im Dezember'
    },
    {
      checkIn: new Date('2024-12-20'),
      checkOut: new Date('2024-12-27'),
      nights: 7,
      expectedDiscount: 30,
      description: '7 Nächte im Dezember'
    }
  ];
  
  // Get apartment
  const apartment = await prisma.apartment.findUnique({
    where: { id: apartmentId },
    select: { price: true, title: true }
  });
  
  console.log(`Apartment: ${apartment.title}`);
  console.log(`Base Price: CHF ${apartment.price}\n`);
  
  // Get December season prices
  const decemberPrices = await prisma.seasonPrice.findMany({
    where: {
      apartmentId,
      startDate: { lte: '2024-12-31' },
      endDate: { gte: '2024-12-01' },
      isActive: true
    }
  });
  
  console.log('December Season Prices:');
  decemberPrices.forEach(sp => {
    console.log(`  - ${sp.name}: CHF ${sp.price} (${sp.startDate} to ${sp.endDate})`);
  });
  console.log('');
  
  // Get discount rules
  const discountRules = await prisma.discountRule.findMany({
    where: { apartmentId, isActive: true },
    orderBy: { minNights: 'asc' }
  });
  
  console.log('Active Discount Rules:');
  discountRules.forEach(rule => {
    console.log(`  - ${rule.minNights}+ nights: ${rule.percentage}% discount`);
  });
  console.log('\n---\n');
  
  // Test each case
  for (const testCase of testCases) {
    console.log(`Test: ${testCase.description}`);
    console.log(`Dates: ${testCase.checkIn.toDateString()} to ${testCase.checkOut.toDateString()}`);
    console.log(`Nights: ${testCase.nights}`);
    
    // Calculate price for each night
    let subtotal = 0;
    const prices = [];
    const currentDate = new Date(testCase.checkIn);
    
    while (currentDate < testCase.checkOut) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Check for season price
      const seasonPrice = await prisma.seasonPrice.findFirst({
        where: {
          apartmentId,
          startDate: { lte: dateStr },
          endDate: { gte: dateStr },
          isActive: true
        },
        orderBy: { priority: 'desc' }
      });
      
      const nightPrice = seasonPrice ? seasonPrice.price : apartment.price;
      prices.push(nightPrice);
      subtotal += nightPrice;
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    console.log(`Prices per night: ${prices.join(', ')} CHF`);
    console.log(`Subtotal (before discount): CHF ${subtotal}`);
    
    // Get applicable discount
    const discountRule = discountRules.find(rule => 
      rule.minNights <= testCase.nights
    );
    
    // Get the highest applicable discount
    const applicableRule = discountRules.filter(rule => 
      rule.minNights <= testCase.nights
    ).sort((a, b) => b.minNights - a.minNights)[0];
    
    const discountPercentage = applicableRule?.percentage || 0;
    const discountAmount = (subtotal * discountPercentage) / 100;
    const afterDiscount = subtotal - discountAmount;
    
    console.log(`Applied discount: ${discountPercentage}% (Expected: ${testCase.expectedDiscount}%)`);
    console.log(`Discount amount: CHF ${discountAmount.toFixed(2)}`);
    console.log(`After discount: CHF ${afterDiscount.toFixed(2)}`);
    
    if (discountPercentage === testCase.expectedDiscount) {
      console.log('✅ CORRECT DISCOUNT APPLIED!');
    } else {
      console.log(`❌ WRONG DISCOUNT! Expected ${testCase.expectedDiscount}%, got ${discountPercentage}%`);
    }
    
    console.log('---\n');
  }
}

testPricing()
  .catch(console.error)
  .finally(() => prisma.$disconnect());