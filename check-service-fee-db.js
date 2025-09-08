const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const apartment = await prisma.apartment.findUnique({
    where: { id: 'cmf4aplby000fujq0r1509971' },
    select: { 
      price: true, 
      cleaningFee: true, 
      serviceFeePercentage: true, 
      title: true 
    }
  });
  
  console.log('Apartment data:', apartment);
  
  // Set service fee to 15% if not set
  if (!apartment.serviceFeePercentage || apartment.serviceFeePercentage === 0) {
    const updated = await prisma.apartment.update({
      where: { id: 'cmf4aplby000fujq0r1509971' },
      data: { serviceFeePercentage: 15 }
    });
    console.log('Updated service fee to 15%');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());