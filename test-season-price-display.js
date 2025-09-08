const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testSeasonPriceDisplay() {
  try {
    // Get today's date
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    
    console.log(`Testing season price display for date: ${dateStr}`)
    console.log('================================================')
    
    // Get all active apartments
    const apartments = await prisma.apartment.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        price: true
      }
    })
    
    for (const apartment of apartments) {
      console.log(`\nApartment: ${apartment.title}`)
      console.log(`Base Price: CHF ${apartment.price}`)
      
      // Check for season prices (excluding event type)
      const seasonPrice = await prisma.seasonPrice.findFirst({
        where: {
          apartmentId: apartment.id,
          startDate: { lte: dateStr },
          endDate: { gte: dateStr },
          isActive: true,
          type: { not: 'SPECIAL_EVENT' }
        },
        orderBy: { priority: 'desc' }
      })
      
      // Check for event prices (for comparison)
      const eventPrice = await prisma.eventPrice.findFirst({
        where: {
          apartmentId: apartment.id,
          startDate: { lte: dateStr },
          endDate: { gte: dateStr },
          isActive: true
        }
      })
      
      if (seasonPrice) {
        console.log(`Season Price: CHF ${seasonPrice.price} (${seasonPrice.name})`)
        console.log(`Display: CHF ${seasonPrice.price} with CHF ${apartment.price} crossed out`)
      } else {
        console.log(`No season price - displaying base price: CHF ${apartment.price}`)
      }
      
      if (eventPrice) {
        console.log(`Note: Event price exists (CHF ${eventPrice.price} - ${eventPrice.eventName}) but not shown on main page`)
      }
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testSeasonPriceDisplay()