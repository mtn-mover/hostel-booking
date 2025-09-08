const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testPricing() {
  try {
    const apartmentId = 'cmf4aplby000fujq0r1509971'
    const testDate = '2025-09-10' // Should be in Summer season
    
    // Test 1: Find season price for a specific date
    const seasonPrice = await prisma.seasonPrice.findFirst({
      where: {
        apartmentId,
        startDate: { lte: testDate },
        endDate: { gte: testDate },
        isActive: true
      },
      orderBy: {
        priority: 'desc'
      }
    })
    
    console.log('Test Date:', testDate)
    if (seasonPrice) {
      console.log('Found season:', seasonPrice.name, '- Price:', seasonPrice.price, 'CHF')
    } else {
      console.log('No season found for this date')
    }
    
    // Test 2: Check multiple dates
    const testDates = [
      '2025-09-10', // Summer
      '2025-10-20', // Fall
      '2025-12-15', // Winter
      '2026-02-01', // Ski
      '2026-04-15'  // Spring
    ]
    
    console.log('\nTesting multiple dates:')
    for (const date of testDates) {
      const season = await prisma.seasonPrice.findFirst({
        where: {
          apartmentId,
          startDate: { lte: date },
          endDate: { gte: date },
          isActive: true
        },
        orderBy: {
          priority: 'desc'
        }
      })
      
      if (season) {
        console.log(`${date}: ${season.name} - ${season.price} CHF`)
      } else {
        console.log(`${date}: No season (base price)`)
      }
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testPricing()