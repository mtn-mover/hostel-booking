import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Comprehensive list of Airbnb-style amenities organized by category (German)
const amenitiesData = [
  // Grundausstattung
  { name: 'WLAN', category: 'Grundausstattung', icon: '📶' },
  { name: 'TV', category: 'Grundausstattung', icon: '📺' },
  { name: 'Küche', category: 'Grundausstattung', icon: '🍳' },
  { name: 'Waschmaschine', category: 'Grundausstattung', icon: '🧺' },
  { name: 'Kostenlose Parkplätze', category: 'Grundausstattung', icon: '🚗' },
  { name: 'Kostenpflichtige Parkplätze', category: 'Grundausstattung', icon: '🅿️' },
  { name: 'Klimaanlage', category: 'Grundausstattung', icon: '❄️' },
  { name: 'Arbeitsplatz', category: 'Grundausstattung', icon: '💼' },

  // Schlafzimmer & Wäsche
  { name: 'Bettwäsche', category: 'Schlafzimmer', icon: '🛏️' },
  { name: 'Kleiderbügel', category: 'Schlafzimmer', icon: '👔' },
  { name: 'Zusätzliche Kissen und Decken', category: 'Schlafzimmer', icon: '🛌' },
  { name: 'Verdunkelungsvorhänge', category: 'Schlafzimmer', icon: '🌙' },
  { name: 'Bügeleisen', category: 'Schlafzimmer', icon: '👕' },
  { name: 'Wäschetrockner', category: 'Schlafzimmer', icon: '🌀' },

  // Badezimmer
  { name: 'Haartrockner', category: 'Badezimmer', icon: '💨' },
  { name: 'Shampoo', category: 'Badezimmer', icon: '🧴' },
  { name: 'Duschgel', category: 'Badezimmer', icon: '🧼' },
  { name: 'Heisses Wasser', category: 'Badezimmer', icon: '🚿' },
  { name: 'Handtücher', category: 'Badezimmer', icon: '🏖️' },
  { name: 'Seife', category: 'Badezimmer', icon: '🧼' },
  { name: 'Toilettenpapier', category: 'Badezimmer', icon: '🧻' },
  { name: 'Badewanne', category: 'Badezimmer', icon: '🛁' },

  // Küche & Essbereich
  { name: 'Kühlschrank', category: 'Küche & Essbereich', icon: '❄️' },
  { name: 'Mikrowelle', category: 'Küche & Essbereich', icon: '📦' },
  { name: 'Kochutensilien', category: 'Küche & Essbereich', icon: '🍴' },
  { name: 'Geschirr und Besteck', category: 'Küche & Essbereich', icon: '🍽️' },
  { name: 'Geschirrspüler', category: 'Küche & Essbereich', icon: '🍽️' },
  { name: 'Herd', category: 'Küche & Essbereich', icon: '🔥' },
  { name: 'Backofen', category: 'Küche & Essbereich', icon: '🥧' },
  { name: 'Kaffeemaschine', category: 'Küche & Essbereich', icon: '☕' },
  { name: 'Wasserkocher', category: 'Küche & Essbereich', icon: '🫖' },
  { name: 'Weingläser', category: 'Küche & Essbereich', icon: '🍷' },
  { name: 'Toaster', category: 'Küche & Essbereich', icon: '🍞' },
  { name: 'Esstisch', category: 'Küche & Essbereich', icon: '🪑' },

  // Unterhaltung & Freizeit
  { name: 'Pool', category: 'Unterhaltung', icon: '🏊' },
  { name: 'Whirlpool', category: 'Unterhaltung', icon: '💆' },
  { name: 'Grill', category: 'Unterhaltung', icon: '🍖' },
  { name: 'Aussenbereich zum Essen', category: 'Unterhaltung', icon: '🌳' },
  { name: 'Feuerstelle', category: 'Unterhaltung', icon: '🔥' },
  { name: 'Billardtisch', category: 'Unterhaltung', icon: '🎱' },
  { name: 'Indoor-Kamin', category: 'Unterhaltung', icon: '🔥' },
  { name: 'Spielkonsole', category: 'Unterhaltung', icon: '🎮' },
  { name: 'Klavier', category: 'Unterhaltung', icon: '🎹' },
  { name: 'Fitnessraum', category: 'Unterhaltung', icon: '💪' },
  { name: 'Sauna', category: 'Unterhaltung', icon: '🧖' },

  // Familie & Kinder
  { name: 'Kinderbett', category: 'Familie', icon: '👶' },
  { name: 'Hochstuhl', category: 'Familie', icon: '🪑' },
  { name: 'Kindersicherung an Treppen', category: 'Familie', icon: '🚸' },
  { name: 'Kinderspielzeug', category: 'Familie', icon: '🧸' },
  { name: 'Kinderbücher', category: 'Familie', icon: '📚' },
  { name: 'Babybadewanne', category: 'Familie', icon: '🛁' },
  { name: 'Wickeltisch', category: 'Familie', icon: '👶' },
  { name: 'Steckdosenschutz', category: 'Familie', icon: '🔌' },

  // Sicherheit
  { name: 'Rauchmelder', category: 'Sicherheit', icon: '🚨' },
  { name: 'Kohlenmonoxidmelder', category: 'Sicherheit', icon: '⚠️' },
  { name: 'Feuerlöscher', category: 'Sicherheit', icon: '🧯' },
  { name: 'Erste-Hilfe-Set', category: 'Sicherheit', icon: '🏥' },
  { name: 'Safe', category: 'Sicherheit', icon: '🔐' },
  { name: 'Schloss am Schlafzimmer', category: 'Sicherheit', icon: '🔒' },

  // Services & Regeln
  { name: 'Selbst-Check-in', category: 'Services', icon: '🔑' },
  { name: 'Gepäckaufbewahrung', category: 'Services', icon: '🧳' },
  { name: 'Reinigung vor Check-out', category: 'Services', icon: '🧹' },
  { name: 'Langzeitaufenthalte erlaubt', category: 'Services', icon: '📅' },
  { name: 'Haustiere erlaubt', category: 'Services', icon: '🐕' },
  { name: 'Rauchen erlaubt', category: 'Services', icon: '🚬' },
  { name: 'Veranstaltungen erlaubt', category: 'Services', icon: '🎉' },

  // Lage & Aussenbereich
  { name: 'Strandnähe', category: 'Lage & Aussenbereich', icon: '🏖️' },
  { name: 'Seeblick', category: 'Lage & Aussenbereich', icon: '🌊' },
  { name: 'Bergblick', category: 'Lage & Aussenbereich', icon: '⛰️' },
  { name: 'Stadtzentrum', category: 'Lage & Aussenbereich', icon: '🏙️' },
  { name: 'Öffentliche Verkehrsmittel', category: 'Lage & Aussenbereich', icon: '🚌' },
  { name: 'Bahnhofsnähe', category: 'Lage & Aussenbereich', icon: '🚂' },
  { name: 'Skilift-Zugang', category: 'Lage & Aussenbereich', icon: '🎿' },
  { name: 'Balkon', category: 'Lage & Aussenbereich', icon: '🏠' },
  { name: 'Terrasse', category: 'Lage & Aussenbereich', icon: '🌿' },
  { name: 'Garten', category: 'Lage & Aussenbereich', icon: '🌳' },
  { name: 'Privater Eingang', category: 'Lage & Aussenbereich', icon: '🚪' },

  // Barrierefreiheit
  { name: 'Rollstuhlgerecht', category: 'Barrierefreiheit', icon: '♿' },
  { name: 'Aufzug', category: 'Barrierefreiheit', icon: '🛗' },
  { name: 'Ebenerdige Dusche', category: 'Barrierefreiheit', icon: '🚿' },
  { name: 'Breite Türen', category: 'Barrierefreiheit', icon: '🚪' },
  { name: 'Haltegriffe im Bad', category: 'Barrierefreiheit', icon: '🤝' },

  // Internet & Multimedia
  { name: 'Ethernet-Anschluss', category: 'Internet & Multimedia', icon: '🔌' },
  { name: 'Schnelles WLAN', category: 'Internet & Multimedia', icon: '📶' },
  { name: 'Smart TV', category: 'Internet & Multimedia', icon: '📺' },
  { name: 'Netflix', category: 'Internet & Multimedia', icon: '🎬' },
  { name: 'Amazon Prime Video', category: 'Internet & Multimedia', icon: '📽️' },

  // Heizung & Klima
  { name: 'Heizung', category: 'Heizung & Klima', icon: '🔥' },
  { name: 'Fussbodenheizung', category: 'Heizung & Klima', icon: '♨️' },
  { name: 'Ventilator', category: 'Heizung & Klima', icon: '💨' },
  { name: 'Tragbare Heizung', category: 'Heizung & Klima', icon: '🔥' },
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