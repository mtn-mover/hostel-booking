const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Adding Event Weekend pricing rules...')

  // Define event weekends for 2024/2025
  const eventWeekends = [
    // 2024
    { name: 'Jungfrau Marathon Weekend', start: '2024-09-06', end: '2024-09-08', modifier: 1.5 },
    { name: 'Unspunnen Festival', start: '2024-08-30', end: '2024-09-01', modifier: 1.5 },
    { name: 'Top of Europe Marathon', start: '2024-10-11', end: '2024-10-13', modifier: 1.5 },
    
    // 2025
    { name: 'Silvester/Neujahr', start: '2024-12-30', end: '2025-01-02', modifier: 1.5 },
    { name: 'Lauberhorn Ski Rennen', start: '2025-01-17', end: '2025-01-19', modifier: 1.5 },
    { name: 'FIS Ski World Cup Wengen', start: '2025-01-16', end: '2025-01-20', modifier: 1.5 },
    { name: 'Ostern 2025', start: '2025-04-18', end: '2025-04-21', modifier: 1.5 },
    { name: 'Pfingsten 2025', start: '2025-06-07', end: '2025-06-09', modifier: 1.5 },
    { name: 'Swiss National Day', start: '2025-08-01', end: '2025-08-03', modifier: 1.5 },
    { name: 'Jungfrau Marathon 2025', start: '2025-09-05', end: '2025-09-07', modifier: 1.5 },
    { name: 'Interlaken Music Festival', start: '2025-07-18', end: '2025-07-20', modifier: 1.5 },
    { name: 'Greenfield Festival', start: '2025-06-12', end: '2025-06-15', modifier: 1.5 },
  ]

  // Get all apartments
  const apartments = await prisma.apartment.findMany({
    where: { isActive: true }
  })

  for (const apartment of apartments) {
    console.log(`\nAdding event weekends for: ${apartment.title}`)
    
    for (const event of eventWeekends) {
      const ruleId = `${apartment.id}-event-${event.name.replace(/\s+/g, '-').toLowerCase()}`
      
      try {
        await prisma.pricingRule.upsert({
          where: { id: ruleId },
          update: {
            isActive: true,
            priceModifier: event.modifier,
            startDate: new Date(event.start),
            endDate: new Date(event.end),
            priority: 200 // Higher priority than seasonal rules
          },
          create: {
            id: ruleId,
            apartmentId: apartment.id,
            name: `Event: ${event.name}`,
            startDate: new Date(event.start),
            endDate: new Date(event.end),
            seasonType: 'PEAK',
            priceModifier: event.modifier,
            isActive: true,
            priority: 200 // Higher priority than seasonal rules
          }
        })
        
        console.log(`  ✓ ${event.name}: ${event.start} - ${event.end} (+50%%)`)
      } catch (error) {
        console.log(`  ⚠ Skipped ${event.name} (might already exist)`)
      }
    }
  }

  console.log('\n📋 Event Weekend Summary:')
  console.log('================================')
  eventWeekends.forEach(event => {
    const start = new Date(event.start).toLocaleDateString('de-CH')
    const end = new Date(event.end).toLocaleDateString('de-CH')
    console.log(`${event.name.padEnd(30)} | ${start} - ${end} | +50%`)
  })
  
  console.log('\n✅ Event weekends added successfully!')
  console.log('💡 These dates will have a 50% price increase')
}

main()
  .catch((e) => {
    console.error('❌ Error adding event weekends:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })