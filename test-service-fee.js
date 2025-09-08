const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testServiceFee() {
  console.log('=== TESTING SERVICE FEE CONFIGURATION ===\n');
  
  const apartmentId = 'cmf4aplby000fujq0r1509971';
  
  // Get apartment with service fee
  const apartment = await prisma.apartment.findUnique({
    where: { id: apartmentId },
    select: { 
      title: true,
      price: true,
      cleaningFee: true,
      serviceFeePercentage: true
    }
  });
  
  console.log(`Apartment: ${apartment.title}`);
  console.log(`Base Price: CHF ${apartment.price}`);
  console.log(`Cleaning Fee: CHF ${apartment.cleaningFee}`);
  console.log(`Service Fee: ${apartment.serviceFeePercentage}%`);
  console.log('');
  
  // Test different scenarios
  const testCases = [
    { nights: 1, guests: 2 },
    { nights: 4, guests: 2 },
    { nights: 7, guests: 4 }
  ];
  
  for (const test of testCases) {
    console.log(`--- ${test.nights} Night(s), ${test.guests} Guest(s) ---`);
    
    // Get applicable discount
    const discountRule = await prisma.discountRule.findFirst({
      where: {
        apartmentId,
        minNights: { lte: test.nights },
        isActive: true
      },
      orderBy: { minNights: 'desc' }
    });
    
    const discountPercentage = discountRule?.percentage || 0;
    
    // Calculate prices
    const subtotal = apartment.price * test.nights;
    const discountAmount = (subtotal * discountPercentage) / 100;
    const afterDiscount = subtotal - discountAmount;
    const serviceFee = afterDiscount * (apartment.serviceFeePercentage / 100);
    const total = afterDiscount + serviceFee + apartment.cleaningFee;
    
    console.log(`Subtotal: CHF ${subtotal}`);
    if (discountPercentage > 0) {
      console.log(`Discount (${discountPercentage}%): -CHF ${discountAmount.toFixed(2)}`);
      console.log(`After Discount: CHF ${afterDiscount.toFixed(2)}`);
    }
    console.log(`Service Fee (${apartment.serviceFeePercentage}%): CHF ${serviceFee.toFixed(2)}`);
    console.log(`Cleaning Fee: CHF ${apartment.cleaningFee}`);
    console.log(`Total: CHF ${total.toFixed(2)}`);
    console.log('');
  }
  
  // Test updating service fee
  console.log('--- Testing Service Fee Update ---');
  
  // Update to 10%
  await prisma.apartment.update({
    where: { id: apartmentId },
    data: { serviceFeePercentage: 10 }
  });
  
  const updatedApartment = await prisma.apartment.findUnique({
    where: { id: apartmentId },
    select: { serviceFeePercentage: true }
  });
  
  console.log(`Service fee updated to: ${updatedApartment.serviceFeePercentage}%`);
  
  // Calculate with new service fee
  const nights = 4;
  const subtotal = apartment.price * nights;
  const discount = await prisma.discountRule.findFirst({
    where: {
      apartmentId,
      minNights: { lte: nights },
      isActive: true
    },
    orderBy: { minNights: 'desc' }
  });
  
  const discountAmount = (subtotal * (discount?.percentage || 0)) / 100;
  const afterDiscount = subtotal - discountAmount;
  const newServiceFee = afterDiscount * (updatedApartment.serviceFeePercentage / 100);
  
  console.log(`4 nights with 10% service fee: CHF ${newServiceFee.toFixed(2)}`);
  
  // Reset to 15%
  await prisma.apartment.update({
    where: { id: apartmentId },
    data: { serviceFeePercentage: 15 }
  });
  
  console.log('Service fee reset to 15%');
}

testServiceFee()
  .catch(console.error)
  .finally(() => prisma.$disconnect());