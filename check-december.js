const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkDecemberPricing() {
  try {
    const apartmentId = 'cmf4aplby000fujq0r1509971'
    
    // Get all seasons
    const seasons = await prisma.seasonPrice.findMany({
      where: {
        apartmentId,
        isActive: true
      },
      orderBy: {
        startDate: 'asc'
      }
    })
    
    console.log('=== ALLE AKTIVEN SAISONS ===')
    seasons.forEach(season => {
      console.log(`${season.name}:`)
      console.log(`  Preis: ${season.price} CHF`)
      console.log(`  Von: ${season.startDate}`)
      console.log(`  Bis: ${season.endDate}`)
      console.log(`  Typ: ${season.type}`)
      console.log(`  Priorität: ${season.priority}`)
      console.log('')
    })
    
    // Check specific dates in December
    const testDates = [
      '2025-12-01',
      '2025-12-04',
      '2025-12-15',
      '2025-12-24',
      '2025-12-31'
    ]
    
    console.log('=== DEZEMBER PREISE ===')
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
        console.log(`${date}: Keine Saison gefunden (Basispreis)`)
      }
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDecemberPricing()