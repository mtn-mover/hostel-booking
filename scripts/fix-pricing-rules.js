const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Fixing pricing rules...')

  // Deactivate weekend pricing rules for now
  const weekendRules = await prisma.pricingRule.updateMany({
    where: {
      OR: [
        { name: { contains: 'Wochenende' } },
        { name: { contains: 'Samstag' } },
        { dayOfWeek: { in: [5, 6] } }
      ]
    },
    data: {
      isActive: false
    }
  })

  console.log(`✓ Deactivated ${weekendRules.count} weekend rules`)

  // List current active pricing rules
  const activeRules = await prisma.pricingRule.findMany({
    where: { isActive: true },
    select: {
      name: true,
      priceModifier: true,
      seasonType: true,
      apartmentId: true
    }
  })

  console.log('\n📋 Active pricing rules:')
  activeRules.forEach(rule => {
    console.log(`  - ${rule.name}: ${(rule.priceModifier - 1) * 100}% (${rule.seasonType})`)
  })

  console.log('\n✅ Pricing rules fixed!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })