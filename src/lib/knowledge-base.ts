// Hostel Knowledge Base - Central source of truth for the chat system
export const hostelKnowledgeBase = {
  general: {
    name: "Heart of Interlaken Apartments",
    address: "[DEINE ADRESSE HIER]",  // z.B. "Hauptstrasse 15, 3800 Interlaken"
    phone: "[DEINE TELEFONNUMMER]",   // z.B. "+41 79 xxx xx xx"
    email: "[DEINE EMAIL]",           // z.B. "info@heartofinterlaken.ch"
    website: "https://heartofinterlaken.ch",
    languages: ["Deutsch", "English", "Français"],
    apartments: ["Heart 1", "Heart 2", "Heart 3", "Heart 4", "Heart 5"]
  },
  
  checkin: {
    standardTime: "ab 17:00 Uhr",
    lateCheckin: "Kein Problem - Self Check-in mit Code verfügbar",
    earlyCheckin: "Vor 17:00 nach Absprache möglich",
    selfCheckin: "24/7 Self Check-in über Schlüsselbox mit Code",
    checkoutTime: "11:00 Uhr",
    expressCheckout: "Express-Checkout über Schlüsselbox möglich",
    keyReturn: "Schlüssel in Schlüsselbox zurücklegen"
  },
  
  wifi: {
    network: "Heart_Guest_WiFi",
    password: "Interlaken2024",  // Hier dein echtes Passwort eintragen
    passwordInfo: "WiFi Passwort: Interlaken2024",
    speed: "Highspeed Internet in allen Apartments",
    coverage: "100% Abdeckung in allen Räumen",
    streaming: "Netflix, YouTube etc. problemlos möglich"
  },
  
  apartments: {
    "heart1": {
      name: "Heart 1",
      maxGuests: 2,
      size: "Studio Apartment",
      amenities: ["Voll ausgestattete Küche", "Privates Bad", "Smart TV", "WiFi"],
      specialFeatures: "Gemütliches Studio für 2 Personen",
      parking: "Parkplätze in der Nähe verfügbar"
    },
    "heart2": {
      name: "Heart 2",
      maxGuests: 4,
      size: "2-Zimmer Apartment",
      amenities: ["Küche", "Bad", "Wohnzimmer", "Schlafzimmer"],
      specialFeatures: "Ideal für Familien oder kleine Gruppen",
      parking: "Parkplätze verfügbar"
    },
    "20281126": {
      name: "Backpacker Dorm",
      floor: "Erdgeschoss",
      maxGuests: 8,
      size: "60m²",
      amenities: ["4 Etagenbetten", "Gemeinschaftsküche", "Schließfächer", "Gemeinschaftsbereich"],
      specialFeatures: "Perfekt für Gruppen und Budget-Reisende",
      quietHours: "Lebhafte Atmosphäre, Ruhestunden ab 23:00",
      parking: "Öffentliche Parkplätze in der Nähe"
    },
    "1006983308851279367": {
      name: "Penthouse Panorama",
      floor: "5. Stock (Dachgeschoss)",
      maxGuests: 4,
      size: "95m²",
      amenities: ["2 Schlafzimmer", "Luxus-Bad mit Whirlpool", "Große Terrasse", "Premium-Küche", "Home Cinema"],
      specialFeatures: "360° Panoramablick, privater Whirlpool auf Terrasse",
      quietHours: "Absolute Privatsphäre im Dachgeschoss",
      parking: "Privater überdachter Parkplatz"
    }
  },
  
  location: {
    publicTransport: {
      train: "Interlaken Ost: 5 Min zu Fuß",
      bus: "Bushaltestelle direkt vor dem Haus (Linie 103, 104)",
      jungfraujoch: "Abfahrt Jungfraujoch: 7 Min zu Fuß zum Bahnhof"
    },
    parking: {
      onsite: "Kostenlose Parkplätze für Gäste",
      public: "Öffentliche Parkplätze: CHF 5/Tag",
      electric: "2 E-Ladestationen verfügbar (CHF 0.35/kWh)"
    },
    nearby: {
      supermarket: "Coop: 2 Minuten zu Fuß",
      restaurants: "15+ Restaurants in 5 Minuten Umkreis",
      atm: "Bankomat: 100m",
      pharmacy: "Apotheke: 3 Minuten"
    }
  },
  
  recommendations: {
    restaurants: [
      {
        name: "Restaurant Alpenblick",
        distance: "2 Minuten",
        cuisine: "Traditionelle Schweizer Küche",
        priceRange: "CHF 25-40",
        specialty: "Fondue und Raclette",
        reservation: "Empfohlen am Wochenende"
      },
      {
        name: "Hütte Bar",
        distance: "50 Meter",
        cuisine: "Bar & Grill",
        priceRange: "CHF 15-25",
        specialty: "Burger und lokale Biere",
        happyHour: "17:00-19:00 täglich"
      },
      {
        name: "Pizzeria Napoli",
        distance: "5 Minuten",
        cuisine: "Italienisch",
        priceRange: "CHF 18-30",
        specialty: "Holzofen-Pizza",
        delivery: "Lieferung ins Hostel möglich"
      }
    ],
    activities: [
      {
        name: "Jungfraujoch",
        type: "Berg-Ausflug",
        duration: "Ganzer Tag",
        price: "CHF 235 (mit Gästekarte: CHF 188)",
        booking: "Online oder am Bahnhof"
      },
      {
        name: "Harder Kulm",
        type: "Aussichtspunkt",
        duration: "2-3 Stunden",
        price: "CHF 38",
        tip: "Sonnenuntergang ist spektakulär"
      },
      {
        name: "Paragliding",
        type: "Adventure",
        duration: "20 Minuten Flug",
        price: "CHF 170",
        booking: "Wir können für Sie reservieren"
      },
      {
        name: "Brienzersee Schifffahrt",
        type: "Schifffahrt",
        duration: "2-4 Stunden",
        price: "CHF 40-60",
        included: "Mit Gästekarte 50% Rabatt"
      }
    ],
    shopping: [
      {
        name: "Coop Supermarkt",
        distance: "2 Minuten",
        hours: "Mo-Sa: 7:00-20:00, So: 9:00-18:00"
      },
      {
        name: "Migros",
        distance: "8 Minuten",
        hours: "Mo-Sa: 8:00-19:00"
      },
      {
        name: "Höheweg Shopping",
        distance: "10 Minuten",
        type: "Souvenirs und lokale Produkte"
      }
    ]
  },
  
  policies: {
    smoking: "Rauchfrei in allen Innenräumen, Balkon/Terrasse erlaubt",
    pets: {
      dogs: "Kleine Hunde (< 10kg): CHF 20/Nacht",
      cats: "Katzen: CHF 15/Nacht",
      maxPets: "Maximal 2 Haustiere pro Apartment",
      rules: "Haustiere dürfen nicht allein gelassen werden"
    },
    parties: "Keine Partys, Ruhezeit ab 22:00 Uhr",
    visitors: "Tagesbesucher erlaubt bis 22:00 Uhr",
    cancellation: {
      flexible: "Kostenlos bis 24h vor Anreise",
      nonRefundable: "20% Rabatt, keine Stornierung möglich",
      longStay: "Bei > 7 Nächten: 48h Stornierungsfrist"
    },
    damage: "Kaution CHF 200 (wird nach Check-out zurückerstattet)",
    cleaning: {
      included: "Endreinigung im Preis inbegriffen",
      during: "Zwischenreinigung auf Anfrage: CHF 50",
      supplies: "Reinigungsmittel vorhanden"
    }
  },
  
  amenities: {
    kitchen: {
      equipment: "Herd, Backofen, Mikrowelle, Kühlschrank, Geschirrspüler",
      utensils: "Komplettes Geschirr und Kochutensilien",
      basics: "Salz, Pfeffer, Öl, Gewürze vorhanden",
      coffee: "Nespresso-Maschine (Kapseln im Shop erhältlich)"
    },
    laundry: {
      washer: "Waschmaschine: CHF 5 pro Waschgang",
      dryer: "Trockner: CHF 5 pro Trockengang",
      detergent: "Waschmittel: CHF 2 oder eigenes verwenden",
      location: "Waschküche im Keller, Zugang mit Zimmerschlüssel"
    },
    entertainment: {
      tv: "Smart TV mit Netflix, YouTube",
      games: "Brettspiele in der Lobby",
      books: "Büchertausch-Regal",
      bikes: "Fahrradverleih: CHF 25/Tag"
    },
    safety: {
      safes: "Safe in jedem Apartment",
      lockers: "Schließfächer für Wertsachen",
      cctv: "24/7 Überwachung Eingänge",
      emergency: "Notfall-Nummer: 112 oder +41 33 123 45 99"
    }
  },
  
  transport: {
    guestCard: {
      included: "Gratis Gästekarte bei Ankunft",
      benefits: "Freie Fahrt mit Bus, 50% auf Bergbahnen",
      validity: "Gültig während gesamtem Aufenthalt"
    },
    airport: {
      zurich: "2.5 Stunden mit Zug (CHF 75)",
      geneva: "3 Stunden mit Zug (CHF 85)",
      bern: "1 Stunde mit Zug (CHF 35)",
      transfer: "Privattransfer auf Anfrage möglich"
    },
    carRental: {
      partner: "Europcar 5 Min entfernt",
      discount: "10% Rabatt für unsere Gäste",
      booking: "Wir reservieren gerne für Sie"
    }
  },
  
  emergency: {
    medical: {
      hospital: "Spital Interlaken: +41 33 826 26 26",
      pharmacy24h: "Notfall-Apotheke: +41 33 822 12 22",
      doctor: "Dr. Meyer (spricht EN/DE/FR): +41 33 821 41 41"
    },
    hostelEmergency: {
      number: "+41 79 123 45 67",
      available: "24/7 für Notfälle",
      nonEmergency: "Normale Anfragen: 8:00-20:00"
    },
    police: "117",
    fire: "118",
    ambulance: "144"
  },
  
  seasonal: {
    summer: {
      period: "Juni - September",
      activities: "Wandern, Schwimmen, Paragliding",
      events: "Jungfrau Marathon (September), Tell-Spiele",
      weather: "15-25°C, kann regnen - Regenjacke empfohlen"
    },
    winter: {
      period: "Dezember - März",
      activities: "Skifahren, Snowboarden, Schlitteln",
      skiStorage: "Gratis Ski-Raum mit Schuhtrockner",
      nearestSlope: "Grindelwald: 30 Min mit Zug"
    },
    special: {
      christmas: "24-26.12: Spezial-Dekoration, Glühwein abends",
      newYear: "31.12: Feuerwerk vom Balkon sichtbar",
      easter: "Oster-Eiersuche für Kinder"
    }
  },
  
  bookingInfo: {
    payment: {
      accepted: "Kreditkarte, Debitkarte, Überweisung, Bar",
      deposit: "30% Anzahlung bei Buchung",
      balance: "Restbetrag bei Ankunft",
      currency: "CHF, EUR akzeptiert (Wechselkurs täglich)"
    },
    discounts: {
      longStay: "7+ Nächte: 10% Rabatt",
      earlyBird: "60+ Tage voraus: 15% Rabatt",
      lastMinute: "Innerhalb 48h: 20% Rabatt (wenn verfügbar)",
      group: "4+ Apartments: Gruppenrabatt möglich"
    }
  },
  
  covid: {
    cleaning: "Verstärkte Reinigung nach WHO-Standards",
    contactless: "Kontaktloser Check-in/out möglich",
    flexible: "Kostenlose Umbuchung bei Covid-Erkrankung",
    masks: "Masken in Gemeinschaftsräumen optional"
  }
};

// Categories for organizing learned knowledge
export const knowledgeCategories = [
  'general',
  'checkin',
  'checkout',
  'wifi',
  'apartments',
  'location',
  'recommendations',
  'policies',
  'amenities',
  'transport',
  'emergency',
  'seasonal',
  'booking',
  'payment',
  'covid',
  'custom'
] as const;

export type KnowledgeCategory = typeof knowledgeCategories[number];

// Helper function to search knowledge base
export function searchKnowledgeBase(query: string, category?: KnowledgeCategory) {
  const searchLower = query.toLowerCase();
  const results: any[] = [];
  
  const searchObject = (obj: any, path: string[] = []) => {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = [...path, key];
      
      if (typeof value === 'string') {
        if (value.toLowerCase().includes(searchLower) || key.toLowerCase().includes(searchLower)) {
          results.push({
            path: currentPath.join('.'),
            key,
            value,
            relevance: value.toLowerCase() === searchLower ? 1 : 0.5
          });
        }
      } else if (typeof value === 'object' && value !== null) {
        searchObject(value, currentPath);
      }
    }
  };
  
  if (category) {
    searchObject(hostelKnowledgeBase[category as keyof typeof hostelKnowledgeBase]);
  } else {
    searchObject(hostelKnowledgeBase);
  }
  
  return results.sort((a, b) => b.relevance - a.relevance);
}

// Export for use in chat system
export default hostelKnowledgeBase;