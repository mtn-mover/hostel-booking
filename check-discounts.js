const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const discounts = await prisma.discountRule.findMany({
    where: { isActive: true },
    orderBy: { minNights: 'asc' },
    select: { 
      apartmentId: true, 
      minNights: true, 
      percentage: true 
    }
  });
  
  console.log('Active Discount Rules:');
  console.log(JSON.stringify(discounts, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());