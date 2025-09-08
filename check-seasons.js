const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkSeasons() {
  try {
    const seasons = await prisma.seasonPrice.findMany({
      where: {
        apartmentId: 'cmf4aplby000fujq0r1509971'
      },
      orderBy: {
        startDate: 'asc'
      }
    })
    
    console.log('Found', seasons.length, 'seasons:')
    seasons.forEach(season => {
      console.log(`- ${season.name}: ${season.price} CHF (${season.startDate} to ${season.endDate})`)
    })
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSeasons()