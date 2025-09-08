const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testDecemberPrice() {
  try {
    const apartmentId = 'cmf4aplby000fujq0r1509971'
    
    // Test with different date formats
    const testDate = '2024-12-04' // Current year December
    const testDate2025 = '2025-12-04' // Next year December
    
    console.log('=== TESTING DECEMBER 4th PRICING ===')
    
    // Check 2024
    console.log('\n--- Testing 2024-12-04 ---')
    const season2024 = await prisma.seasonPrice.findFirst({
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
    
    if (season2024) {
      console.log(`Found: ${season2024.name} - ${season2024.price} CHF`)
      console.log(`Season dates: ${season2024.startDate} to ${season2024.endDate}`)
    } else {
      console.log('No season found for 2024-12-04')
    }
    
    // Check 2025
    console.log('\n--- Testing 2025-12-04 ---')
    const season2025 = await prisma.seasonPrice.findFirst({
      where: {
        apartmentId,
        startDate: { lte: testDate2025 },
        endDate: { gte: testDate2025 },
        isActive: true
      },
      orderBy: {
        priority: 'desc'
      }
    })
    
    if (season2025) {
      console.log(`Found: ${season2025.name} - ${season2025.price} CHF`)
      console.log(`Season dates: ${season2025.startDate} to ${season2025.endDate}`)
    } else {
      console.log('No season found for 2025-12-04')
    }
    
    // Get apartment base price
    const apartment = await prisma.apartment.findUnique({
      where: { id: apartmentId },
      select: { price: true }
    })
    
    console.log(`\nBase price: ${apartment.price} CHF`)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDecemberPrice()