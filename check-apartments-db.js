const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkApartments() {
  try {
    const apartments = await prisma.apartment.findMany({
      include: {
        apartmentImages: true,
        _count: {
          select: {
            bookings: true,
            reviews: true
          }
        }
      }
    })
    
    console.log('Total apartments in database:', apartments.length)
    console.log('\nApartments:')
    apartments.forEach(apt => {
      console.log(`- ${apt.title || apt.name} (ID: ${apt.id})`)
      console.log(`  Location: ${apt.location}`)
      console.log(`  Active: ${apt.isActive}`)
      console.log(`  Images: ${apt.apartmentImages.length}`)
      console.log(`  Bookings: ${apt._count.bookings}`)
      console.log(`  Reviews: ${apt._count.reviews}`)
    })
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkApartments()