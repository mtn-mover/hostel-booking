const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('📋 Apartment Übersicht für Prisma Studio:\n')

  const apartments = await prisma.apartment.findMany({
    select: {
      id: true,
      title: true,
      name: true,
      price: true,
      maxGuests: true,
      bedrooms: true,
      isActive: true,
      airbnbId: true
    },
    orderBy: {
      title: 'asc'
    }
  })

  console.log('┌─────────────────────────────────────────────────────────────────────────────────────────┐')
  console.log('│                            APARTMENT REFERENCE LISTE                                   │')
  console.log('├─────────────────────────────────────────────────────────────────────────────────────────┤')
  
  apartments.forEach((apartment, index) => {
    const shortId = apartment.id.substring(0, 8) + '...'
    const title = apartment.title.padEnd(35)
    const price = `CHF ${apartment.price}`.padEnd(10)
    const guests = `${apartment.maxGuests}G`.padEnd(3)
    const bedrooms = `${apartment.bedrooms}BR`.padEnd(4)
    const status = apartment.isActive ? '✅' : '❌'
    const airbnb = apartment.airbnbId ? '🏠' : '  '
    
    console.log(`│ ${index + 1}. ${shortId} │ ${title} │ ${price} │ ${guests} │ ${bedrooms} │ ${status} │ ${airbnb} │`)
  })
  
  console.log('├─────────────────────────────────────────────────────────────────────────────────────────┤')
  console.log('│ Legende: G=Gäste, BR=Schlafzimmer, ✅=Aktiv, ❌=Inaktiv, 🏠=Airbnb                    │')
  console.log('└─────────────────────────────────────────────────────────────────────────────────────────┘\n')

  console.log('🔍 Für Prisma Studio (http://localhost:5555):')
  console.log('   Kopieren Sie diese IDs für Ihre Referenz:\n')
  
  apartments.forEach((apartment, index) => {
    console.log(`   ${index + 1}. ${apartment.title}`)
    console.log(`      ID: ${apartment.id}`)
    console.log(`      Preis: CHF ${apartment.price}/Nacht`)
    if (apartment.airbnbId) {
      console.log(`      Airbnb ID: ${apartment.airbnbId}`)
    }
    console.log('')
  })

  console.log('💡 Tipp: Lassen Sie dieses Terminal offen als Referenz beim Arbeiten mit Prisma Studio!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })