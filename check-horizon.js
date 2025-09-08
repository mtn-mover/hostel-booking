const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkHorizon() {
  try {
    const apartments = await prisma.apartment.findMany({
      select: {
        id: true,
        title: true,
        bookingHorizon: true
      }
    })
    
    console.log('Apartments and their booking horizons:')
    apartments.forEach(apt => {
      console.log(`${apt.title}: ${apt.bookingHorizon || 'NOT SET'}`)
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkHorizon()