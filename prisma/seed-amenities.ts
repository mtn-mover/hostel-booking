import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Comprehensive list of Airbnb-style amenities organized by category
const amenitiesData = [
  // Basic
  { name: 'WLAN', category: 'Basic', icon: '📶' },
  { name: 'TV', category: 'Basic', icon: '📺' },
  { name: 'Küche', category: 'Basic', icon: '🍳' },
  { name: 'Waschmaschine', category: 'Basic', icon: '🧺' },
  { name: 'Kostenlose Parkplätze', category: 'Basic', icon: '🚗' },
  { name: 'Kostenpflichtige Parkplätze', category: 'Basic', icon: '🅿️' },
  { name: 'Klimaanlage', category: 'Basic', icon: '❄️' },
  { name: 'Arbeitsplatz', category: 'Basic', icon: '💼' },
  
  // Bedroom & Laundry
  { name: 'Bettwäsche', category: 'Bedroom', icon: '🛏️' },
  { name: 'Kleiderbügel', category: 'Bedroom', icon: '👔' },
  { name: 'Zusätzliche Kissen und Decken', category: 'Bedroom', icon: '🛌' },
  { name: 'Verdunkelungsvorhänge', category: 'Bedroom', icon: '🌙' },
  { name: 'Bügeleisen', category: 'Bedroom', icon: '👕' },
  { name: 'Wäschetrockner', category: 'Bedroom', icon: '🌀' },
  
  // Bathroom
  { name: 'Haartrockner', category: 'Bathroom', icon: '💨' },
  { name: 'Shampoo', category: 'Bathroom', icon: '🧴' },
  { name: 'Duschgel', category: 'Bathroom', icon: '🧼' },
  { name: 'Heißes Wasser', category: 'Bathroom', icon: '🚿' },
  { name: 'Handtücher', category: 'Bathroom', icon: '🏖️' },
  { name: 'Seife', category: 'Bathroom', icon: '🧼' },
  { name: 'Toilettenpapier', category: 'Bathroom', icon: '🧻' },
  { name: 'Badewanne', category: 'Bathroom', icon: '🛁' },
  
  // Kitchen & Dining
  { name: 'Kühlschrank', category: 'Kitchen', icon: '❄️' },
  { name: 'Mikrowelle', category: 'Kitchen', icon: '📦' },
  { name: 'Kochutensilien', category: 'Kitchen', icon: '🍴' },
  { name: 'Geschirr und Besteck', category: 'Kitchen', icon: '🍽️' },
  { name: 'Geschirrspüler', category: 'Kitchen', icon: '🍽️' },
  { name: 'Herd', category: 'Kitchen', icon: '🔥' },
  { name: 'Backofen', category: 'Kitchen', icon: '🥧' },
  { name: 'Kaffeemaschine', category: 'Kitchen', icon: '☕' },
  { name: 'Wasserkocher', category: 'Kitchen', icon: '🫖' },
  { name: 'Weingläser', category: 'Kitchen', icon: '🍷' },
  { name: 'Toaster', category: 'Kitchen', icon: '🍞' },
  { name: 'Esstisch', category: 'Kitchen', icon: '🪑' },
  
  // Entertainment
  { name: 'Pool', category: 'Entertainment', icon: '🏊' },
  { name: 'Whirlpool', category: 'Entertainment', icon: '💆' },
  { name: 'Grill', category: 'Entertainment', icon: '🍖' },
  { name: 'Außenbereich zum Essen', category: 'Entertainment', icon: '🌳' },
  { name: 'Feuerstelle', category: 'Entertainment', icon: '🔥' },
  { name: 'Billardtisch', category: 'Entertainment', icon: '🎱' },
  { name: 'Indoor-Kamin', category: 'Entertainment', icon: '🔥' },
  { name: 'Spielkonsole', category: 'Entertainment', icon: '🎮' },
  { name: 'Klavier', category: 'Entertainment', icon: '🎹' },
  { name: 'Fitnessraum', category: 'Entertainment', icon: '💪' },
  { name: 'Sauna', category: 'Entertainment', icon: '🧖' },
  
  // Family Features
  { name: 'Kinderbett', category: 'Family', icon: '👶' },
  { name: 'Hochstuhl', category: 'Family', icon: '🪑' },
  { name: 'Kindersicherung an Treppen', category: 'Family', icon: '🚸' },
  { name: 'Kinderspielzeug', category: 'Family', icon: '🧸' },
  { name: 'Kinderbücher', category: 'Family', icon: '📚' },
  { name: 'Babybadewanne', category: 'Family', icon: '🛁' },
  { name: 'Wickeltisch', category: 'Family', icon: '👶' },
  { name: 'Steckdosenschutz', category: 'Family', icon: '🔌' },
  
  // Safety & Security
  { name: 'Rauchmelder', category: 'Safety', icon: '🚨' },
  { name: 'Kohlenmonoxidmelder', category: 'Safety', icon: '⚠️' },
  { name: 'Feuerlöscher', category: 'Safety', icon: '🧯' },
  { name: 'Erste-Hilfe-Set', category: 'Safety', icon: '🏥' },
  { name: 'Safe', category: 'Safety', icon: '🔐' },
  { name: 'Schloss am Schlafzimmer', category: 'Safety', icon: '🔒' },
  
  // Services
  { name: 'Selbst-Check-in', category: 'Services', icon: '🔑' },
  { name: 'Gepäckaufbewahrung', category: 'Services', icon: '🧳' },
  { name: 'Reinigung vor Check-out', category: 'Services', icon: '🧹' },
  { name: 'Langzeitaufenthalte erlaubt', category: 'Services', icon: '📅' },
  { name: 'Haustiere erlaubt', category: 'Services', icon: '🐕' },
  { name: 'Rauchen erlaubt', category: 'Services', icon: '🚬' },
  { name: 'Veranstaltungen erlaubt', category: 'Services', icon: '🎉' },
  
  // Location Features
  { name: 'Strandnähe', category: 'Location', icon: '🏖️' },
  { name: 'Seeblick', category: 'Location', icon: '🌊' },
  { name: 'Bergblick', category: 'Location', icon: '⛰️' },
  { name: 'Stadtzentrum', category: 'Location', icon: '🏙️' },
  { name: 'Öffentliche Verkehrsmittel', category: 'Location', icon: '🚌' },
  { name: 'Bahnhofsnähe', category: 'Location', icon: '🚂' },
  { name: 'Skilift-Zugang', category: 'Location', icon: '🎿' },
  { name: 'Balkon', category: 'Location', icon: '🏠' },
  { name: 'Terrasse', category: 'Location', icon: '🌿' },
  { name: 'Garten', category: 'Location', icon: '🌳' },
  { name: 'Privater Eingang', category: 'Location', icon: '🚪' },
  
  // Accessibility
  { name: 'Rollstuhlgerecht', category: 'Accessibility', icon: '♿' },
  { name: 'Aufzug', category: 'Accessibility', icon: '🛗' },
  { name: 'Ebenerdige Dusche', category: 'Accessibility', icon: '🚿' },
  { name: 'Breite Türen', category: 'Accessibility', icon: '🚪' },
  { name: 'Haltegriffe im Bad', category: 'Accessibility', icon: '🤝' },
  
  // Connectivity
  { name: 'Ethernet-Anschluss', category: 'Connectivity', icon: '🔌' },
  { name: 'Schnelles WLAN', category: 'Connectivity', icon: '📶' },
  { name: 'Smart TV', category: 'Connectivity', icon: '📺' },
  { name: 'Netflix', category: 'Connectivity', icon: '🎬' },
  { name: 'Amazon Prime Video', category: 'Connectivity', icon: '📽️' },
  
  // Climate Control
  { name: 'Heizung', category: 'Climate', icon: '🔥' },
  { name: 'Fußbodenheizung', category: 'Climate', icon: '♨️' },
  { name: 'Ventilator', category: 'Climate', icon: '💨' },
  { name: 'Tragbare Heizung', category: 'Climate', icon: '🔥' },
]

async function main() {
  console.log('🌱 Seeding amenities...')
  
  // Clear existing amenities (optional)
  await prisma.amenity.deleteMany()
  
  // Insert amenities
  for (const amenity of amenitiesData) {
    await prisma.amenity.create({
      data: {
        name: amenity.name,
        category: amenity.category,
        icon: amenity.icon,
      }
    })
    console.log(`✅ Created amenity: ${amenity.name} (${amenity.category})`)
  }
  
  console.log(`\n✨ Successfully seeded ${amenitiesData.length} amenities!`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding amenities:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })