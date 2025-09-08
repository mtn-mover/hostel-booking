const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Adding sample pricing rules...')

  // Get all apartments
  const apartments = await prisma.apartment.findMany({
    where: { isActive: true }
  })

  for (const apartment of apartments) {
    console.log(`Adding pricing rules for apartment: ${apartment.title}`)

    // High season (Summer): June - August
    await prisma.pricingRule.upsert({
      where: {
        id: `${apartment.id}-summer`
      },
      update: {},
      create: {
        id: `${apartment.id}-summer`,
        apartmentId: apartment.id,
        name: 'Hochsaison Sommer',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-08-31'),
        seasonType: 'HIGH',
        priceModifier: 1.3, // 30% increase
        isActive: true,
        priority: 100
      }
    })

    // Peak season (Christmas/New Year): December - January
    await prisma.pricingRule.upsert({
      where: {
        id: `${apartment.id}-winter-peak`
      },
      update: {},
      create: {
        id: `${apartment.id}-winter-peak`,
        apartmentId: apartment.id,
        name: 'Spitzensaison Weihnachten',
        startDate: new Date('2024-12-15'),
        endDate: new Date('2025-01-15'),
        seasonType: 'PEAK',
        priceModifier: 1.5, // 50% increase
        isActive: true,
        priority: 150
      }
    })

    // Low season (November, February, March): 20% discount
    await prisma.pricingRule.upsert({
      where: {
        id: `${apartment.id}-low-season`
      },
      update: {},
      create: {
        id: `${apartment.id}-low-season`,
        apartmentId: apartment.id,
        name: 'Nebensaison',
        startDate: new Date('2024-11-01'),
        endDate: new Date('2025-03-31'),
        seasonType: 'LOW',
        priceModifier: 0.8, // 20% decrease
        isActive: true,
        priority: 50
      }
    })

    // Weekend premium (Friday-Saturday): 15% increase
    await prisma.pricingRule.upsert({
      where: {
        id: `${apartment.id}-weekend`
      },
      update: {},
      create: {
        id: `${apartment.id}-weekend`,
        apartmentId: apartment.id,
        name: 'Wochenende Aufschlag',
        dayOfWeek: 5, // Friday
        seasonType: 'REGULAR',
        priceModifier: 1.15, // 15% increase
        isActive: true,
        priority: 75
      }
    })

    await prisma.pricingRule.upsert({
      where: {
        id: `${apartment.id}-saturday`
      },
      update: {},
      create: {
        id: `${apartment.id}-saturday`,
        apartmentId: apartment.id,
        name: 'Samstag Aufschlag',
        dayOfWeek: 6, // Saturday
        seasonType: 'REGULAR',
        priceModifier: 1.15, // 15% increase
        isActive: true,
        priority: 75
      }
    })

    console.log(`✓ Added pricing rules for ${apartment.title}`)
  }

  console.log('✅ All pricing rules added successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error adding pricing rules:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })