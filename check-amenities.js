const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    const amenities = await prisma.amenity.findMany({
      orderBy: { category: 'asc' }
    })
    
    console.log(`Total amenities in database: ${amenities.length}`)
    
    if (amenities.length === 0) {
      console.log('No amenities found in database!')
    } else {
      // Group by category
      const grouped = {}
      amenities.forEach(a => {
        if (!grouped[a.category]) grouped[a.category] = []
        grouped[a.category].push(a.name)
      })
      
      Object.keys(grouped).forEach(category => {
        console.log(`\n${category}: (${grouped[category].length} items)`)
        grouped[category].forEach(name => console.log(`  - ${name}`))
      })
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()