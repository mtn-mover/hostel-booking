const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Updating pricing rules for seasons and events...')

  // Get all apartments
  const apartments = await prisma.apartment.findMany({
    where: { isActive: true }
  })

  // First, deactivate old seasonal rules
  await prisma.pricingRule.updateMany({
    where: {
      OR: [
        { name: { contains: 'Hochsaison Sommer' } },
        { name: { contains: 'Nebensaison' } },
        { name: { contains: 'Spitzensaison Weihnachten' } }
      ]
    },
    data: {
      isActive: false
    }
  })
  console.log('✓ Deactivated old seasonal rules')

  for (const apartment of apartments) {
    console.log(`\nUpdating rules for: ${apartment.title}`)
    
    // 1. Special Event: Next Weekend (30.8 - 1.9.2024)
    await prisma.pricingRule.upsert({
      where: { id: `${apartment.id}-special-weekend-aug-2024` },
      update: {
        isActive: true,
        priceModifier: 1.5,
        startDate: new Date('2024-08-30'),
        endDate: new Date('2024-09-01'),
        priority: 200
      },
      create: {
        id: `${apartment.id}-special-weekend-aug-2024`,
        apartmentId: apartment.id,
        name: 'Special Event Weekend (30.8-1.9)',
        startDate: new Date('2024-08-30'),
        endDate: new Date('2024-09-01'),
        seasonType: 'PEAK',
        priceModifier: 1.5, // +50%
        isActive: true,
        priority: 200
      }
    })
    console.log('  ✓ Special Event Weekend: 30.8-1.9.2024 (+50%)')

    // 2. Low Season: October to Mid-December
    await prisma.pricingRule.upsert({
      where: { id: `${apartment.id}-low-season-autumn-2024` },
      update: {
        isActive: true,
        priceModifier: 0.8,
        startDate: new Date('2024-10-01'),
        endDate: new Date('2024-12-14'),
        priority: 100
      },
      create: {
        id: `${apartment.id}-low-season-autumn-2024`,
        apartmentId: apartment.id,
        name: 'Low Season (Herbst)',
        startDate: new Date('2024-10-01'),
        endDate: new Date('2024-12-14'),
        seasonType: 'LOW',
        priceModifier: 0.8, // -20%
        isActive: true,
        priority: 100
      }
    })
    console.log('  ✓ Low Season: 1.10-14.12.2024 (-20%)')

    // 3. Peak Season: Mid-December to First Week January
    await prisma.pricingRule.upsert({
      where: { id: `${apartment.id}-peak-season-xmas-2024` },
      update: {
        isActive: true,
        priceModifier: 1.5,
        startDate: new Date('2024-12-15'),
        endDate: new Date('2025-01-07'),
        priority: 150
      },
      create: {
        id: `${apartment.id}-peak-season-xmas-2024`,
        apartmentId: apartment.id,
        name: 'Peak Season (Weihnachten/Neujahr)',
        startDate: new Date('2024-12-15'),
        endDate: new Date('2025-01-07'),
        seasonType: 'PEAK',
        priceModifier: 1.5, // +50%
        isActive: true,
        priority: 150
      }
    })
    console.log('  ✓ Peak Season: 15.12.2024-7.1.2025 (+50%)')

    // 4. Low Season: January to March
    await prisma.pricingRule.upsert({
      where: { id: `${apartment.id}-low-season-winter-2025` },
      update: {
        isActive: true,
        priceModifier: 0.8,
        startDate: new Date('2025-01-08'),
        endDate: new Date('2025-03-31'),
        priority: 100
      },
      create: {
        id: `${apartment.id}-low-season-winter-2025`,
        apartmentId: apartment.id,
        name: 'Low Season (Winter)',
        startDate: new Date('2025-01-08'),
        endDate: new Date('2025-03-31'),
        seasonType: 'LOW',
        priceModifier: 0.8, // -20%
        isActive: true,
        priority: 100
      }
    })
    console.log('  ✓ Low Season: 8.1-31.3.2025 (-20%)')

    // 5. Regular Season: April to May
    await prisma.pricingRule.upsert({
      where: { id: `${apartment.id}-regular-season-spring-2025` },
      update: {
        isActive: true,
        priceModifier: 1.0,
        startDate: new Date('2025-04-01'),
        endDate: new Date('2025-05-31'),
        priority: 100
      },
      create: {
        id: `${apartment.id}-regular-season-spring-2025`,
        apartmentId: apartment.id,
        name: 'Regular Season (Frühling)',
        startDate: new Date('2025-04-01'),
        endDate: new Date('2025-05-31'),
        seasonType: 'REGULAR',
        priceModifier: 1.0, // Normal price
        isActive: true,
        priority: 100
      }
    })
    console.log('  ✓ Regular Season: 1.4-31.5.2025 (Normal)')

    // 6. High Season: June to September
    await prisma.pricingRule.upsert({
      where: { id: `${apartment.id}-high-season-summer-2025` },
      update: {
        isActive: true,
        priceModifier: 1.3,
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-09-30'),
        priority: 100
      },
      create: {
        id: `${apartment.id}-high-season-summer-2025`,
        apartmentId: apartment.id,
        name: 'High Season (Sommer)',
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-09-30'),
        seasonType: 'HIGH',
        priceModifier: 1.3, // +30%
        isActive: true,
        priority: 100
      }
    })
    console.log('  ✓ High Season: 1.6-30.9.2025 (+30%)')
  }

  console.log('\n📋 Jahresübersicht Pricing:')
  console.log('================================')
  console.log('🎯 Special Event:  30.08-01.09.2024  +50%')
  console.log('🍂 Low Season:     01.10-14.12.2024  -20%')
  console.log('🎄 Peak Season:    15.12-07.01.2025  +50%')
  console.log('❄️  Low Season:     08.01-31.03.2025  -20%')
  console.log('🌸 Regular:        01.04-31.05.2025   0%')
  console.log('☀️  High Season:    01.06-30.09.2025  +30%')
  console.log('================================')
  
  console.log('\n✅ All pricing rules updated successfully!')
  console.log('💡 Event weekends remain active with priority 200 (override seasons)')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })