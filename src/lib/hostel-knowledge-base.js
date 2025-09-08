// Hostel Knowledge Base für Claude Chat-Support
// Diese Datei enthält alle hostel-spezifischen Informationen für den Chatbot

export const hostelKnowledgeBase = {
  // Basis-Informationen
  general: {
    name: "Heart of Interlaken Apartments",
    address: "Bahnhofstrasse 15, 3800 Interlaken, Schweiz",
    phone: "+41 33 822 45 67",
    email: "info@heart-interlaken.ch",
    website: "www.heart-interlaken.ch",
    description: "Premium Apartment-Vermietung im Herzen von Interlaken mit 4 wunderschön ausgestatteten Apartments"
  },
  
  // Check-in/Check-out
  checkin: {
    standardTime: "15:00 - 20:00",
    lateCheckin: "Nach 20:00 mit Voranmeldung möglich (CHF 30 Aufschlag)",
    earlyCheckin: "Ab 12:00 gegen Aufpreis von CHF 25 verfügbar (je nach Verfügbarkeit)",
    selfCheckin: "Self-Check-in möglich - Schlüsselbox-Code wird 2 Stunden vor Ankunft per SMS/Email gesendet",
    idRequired: "Gültiger Ausweis (Personalausweis oder Reisepass) erforderlich",
    checkoutTime: "11:00 Uhr (spätes Check-out bis 14:00 gegen CHF 25 möglich)",
    minAge: "Mindestalter 18 Jahre für Hauptgast"
  },
  
  // WLAN & Technik
  wifi: {
    network: "Heart-Interlaken-Guest",
    passwordInfo: "WLAN-Passwort wird bei Check-in per Email/SMS mitgeteilt",
    speed: "100 Mbps Glasfaser in allen Apartments",
    coverage: "Vollständige Abdeckung in allen Bereichen und auf Balkonen",
    techSupport: "24/7 Tech-Support bei WLAN-Problemen verfügbar"
  },
  
  // Apartments (alle 4 mit echten Daten)
  apartments: {
    "heart1": {
      name: "Heart1 - City Studio",
      airbnbId: "24131251",
      maxGuests: 2,
      bedrooms: 1,
      bathrooms: 1,
      size: "35m²",
      amenities: ["Voll ausgestattete Küche", "Smart TV", "Balkon mit Stadtblick", "Kaffeemaschine"],
      specialFeatures: "Perfekt für Paare, zentrale Lage, modernes Design",
      view: "Stadtblick auf Interlaken Zentrum",
      basePrice: 120
    },
    "heart2": {
      name: "Heart2 - Cozy Retreat", 
      airbnbId: "19632116",
      maxGuests: 2,
      bedrooms: 1,
      bathrooms: 1,
      size: "38m²", 
      amenities: ["Voll ausgestattete Küche", "Smart TV", "Balkon mit Bergblick", "Nespresso-Maschine"],
      specialFeatures: "Ruhige Lage, Bergblick, gemütliche Atmosphäre",
      view: "Direkter Blick auf die Berner Alpen",
      basePrice: 125
    },
    "heart3": {
      name: "Heart3 - Modern Comfort",
      airbnbId: "20281126", 
      maxGuests: 4,
      bedrooms: 2,
      bathrooms: 1,
      size: "55m²",
      amenities: ["Große Küche mit Geschirrspüler", "2 Smart TVs", "Großer Balkon", "Waschmaschine"],
      specialFeatures: "Ideal für Familien oder kleine Gruppen, geräumig und modern",
      view: "Panoramablick auf Berge und Stadt",
      basePrice: 180
    },
    "heart5": {
      name: "Heart5 - Luxury Suite",
      airbnbId: "1006983308851279367",
      maxGuests: 6,
      bedrooms: 3,
      bathrooms: 2,
      size: "95m²",
      amenities: ["Premium-Küche mit allen Geräten", "3 Smart TVs", "Große Terrasse", "Waschmaschine", "Trockner"],
      specialFeatures: "Luxuriöses Premium-Apartment, perfekt für größere Gruppen",
      view: "Spektakulärer 180° Panoramablick auf Jungfrau-Massiv",
      basePrice: 350
    }
  },
  
  // Lokale Informationen Interlaken
  location: {
    publicTransport: {
      trainStation: "Interlaken Ost: 3 Minuten zu Fuß, Interlaken West: 8 Minuten",
      busStop: "Bushaltestelle 'Marktplatz' direkt vor der Haustür (50m)",
      tramLine: "Keine Straßenbahn in Interlaken - nur Bus und Bahn",
      skiShuttle: "Kostenloser Ski-Shuttle nach Grindelwald/Wengen im Winter"
    },
    parking: {
      available: true,
      cost: "CHF 15 pro Nacht (öffentlicher Parkplatz 100m entfernt)",
      reservation: "Voranmeldung erforderlich - begrenzte Plätze!",
      alternatives: "Kostenloses Parken am Bahnhof Interlaken Ost (10 Min Fußweg)"
    },
    nearbyServices: {
      supermarket: "Coop direkt gegenüber (Bahnhofstrasse 12)",
      pharmacy: "Apotheke 'Dr. Bähler' 100m entfernt",
      bank: "UBS und Raiffeisen in 200m Entfernung",
      postOffice: "Post-Filiale 150m vom Apartment"
    }
  },
  
  // Restaurants & Aktivitäten in Interlaken
  recommendations: {
    restaurants: [
      {
        name: "Restaurant Taverne",
        distance: "2 Minuten zu Fuß",
        cuisine: "Schweizer Küche, Fondue & Raclette",
        priceRange: "CHF 25-45",
        specialty: "Beste Rösti in Interlaken!"
      },
      {
        name: "Pizzeria Horn", 
        distance: "3 Minuten zu Fuß",
        cuisine: "Italienisch, Pizza & Pasta",
        priceRange: "CHF 18-28",
        specialty: "Authentische italienische Pizza"
      },
      {
        name: "Restaurant Bären",
        distance: "5 Minuten zu Fuß", 
        cuisine: "Gehobene Schweizer Küche",
        priceRange: "CHF 35-65",
        specialty: "Fine Dining mit lokalen Spezialitäten"
      },
      {
        name: "Sushi Zen",
        distance: "4 Minuten zu Fuß",
        cuisine: "Japanisch, Sushi & Ramen", 
        priceRange: "CHF 22-38",
        specialty: "Frischeste Sushi in der Region"
      }
    ],
    attractions: [
      {
        name: "Jungfraujoch - Top of Europe",
        distance: "2 Stunden mit Bahn",
        type: "Ausflug, Gletscher-Erlebnis",
        ticketPrice: "CHF 204 für Erwachsene (mit Gäste-Rabatt CHF 184)",
        openingHours: "6:35 - 18:00 (je nach Saison)",
        tip: "Frühzeitig buchen! Wetterabhängig."
      },
      {
        name: "Harder Kulm",
        distance: "15 Minuten mit Funicular",
        type: "Aussichtspunkt, Restaurant",
        ticketPrice: "CHF 32 für Erwachsene", 
        openingHours: "9:00 - 18:00 (Sommer bis 22:30)",
        tip: "Perfekt für Sonnenuntergänge!"
      },
      {
        name: "Trümmelbach-Fälle",
        distance: "20 Minuten mit Bus",
        type: "Naturwunder, Wasserfälle",
        ticketPrice: "CHF 14 für Erwachsene",
        openingHours: "9:00 - 17:00 (April - Oktober)",
        tip: "UNESCO-Welterbe, absolut sehenswert!"
      },
      {
        name: "Schynige Platte",
        distance: "45 Minuten mit Bahn",
        type: "Wandern, Alpengarten",
        ticketPrice: "CHF 66 für Erwachsene",
        openingHours: "8:00 - 18:00 (Juni - Oktober)",
        tip: "Nostalgische Zahnradbahn von 1893"
      }
    ],
    activities: {
      summer: [
        "Paragliding von Beatenberg",
        "Rafting auf der Aare", 
        "Wandern: Eiger Trail, Lauterbrunnen Valley",
        "Bootsfahrt auf Thuner-/Brienzersee",
        "Canyoning in Grimsel/Haslital"
      ],
      winter: [
        "Skifahren in Grindelwald/Wengen/Mürren",
        "Schlitteln auf der Faulhorn-Abfahrt",
        "Schneeschuhwandern im Lauterbrunnen-Tal",
        "Eislaufen in der Ice Magic Arena",
        "Winterwandern auf Harder Kulm"
      ]
    },
    shopping: {
      supermarket: "Coop (direkt gegenüber), Migros (300m), Volg (500m)",
      pharmacy: "Apotheke Dr. Bähler (100m), Bahnhof-Apotheke (400m)",
      outdoor: "Mammut Store (200m), Intersport (250m) für Outdoor-Ausrüstung",
      souvenirs: "Swiss Souvenirs Shop (150m), Interlaken Tourism Center (300m)"
    }
  },
  
  // Ausstattung & Services
  amenities: {
    kitchen: "Alle Apartments haben voll ausgestattete Küchen mit Geschirrspüler, Backofen, Kühlschrank, Kaffeemaschine",
    laundry: {
      available: true,
      location: "Waschmaschine in Heart3 und Heart5, Gemeinschaftsraum für Heart1 und Heart2", 
      cost: "Kostenlos für Gäste (Waschmittel vorhanden)",
      drying: "Wäscheständer in jedem Apartment, Balkon zum Trocknen"
    },
    storage: "Kostenlose Gepäckaufbewahrung vor Check-in und nach Check-out im sicheren Lagerraum",
    cleaning: {
      included: "Endreinigung im Preis inbegriffen",
      during: "Zwischenreinigung auf Wunsch CHF 45 (bei Aufenthalten über 7 Nächte kostenlos)",
      supplies: "Grundreinigungs-Utensilien in jedem Apartment"
    },
    linens: "Hochwertige Bettwäsche, Handtücher und Bademäntel in allen Apartments inbegriffen"
  },
  
  // Preisstruktur & Rabatte
  pricing: {
    baseRates: {
      heart1: "CHF 120-180/Nacht (je nach Saison)",
      heart2: "CHF 125-185/Nacht (je nach Saison)", 
      heart3: "CHF 180-250/Nacht (je nach Saison)",
      heart5: "CHF 350-525/Nacht (je nach Saison)"
    },
    discounts: {
      duration: "2 Nächte: 15%, 3 Nächte: 25%, 4+ Nächte: 30%",
      seasonal: "Nebensaison (Okt-Dez, Jan-Mär): -20%",
      lastMinute: "Last-Minute-Buchungen (unter 48h): -10%"
    },
    surcharges: {
      christmas: "15.-31. Dezember: +50%",
      events: "Unspunnen-Festival, Jungfrau-Marathon: +50%",
      cleaning: "Keine zusätzliche Reinigungsgebühr",
      service: "Service-Gebühr: 15% vom Zimmerpreis"
    }
  },
  
  // Hausregeln & Policies
  policies: {
    smoking: "Rauchfrei in allen Innenräumen. Rauchen auf Balkonen/Terrassen erlaubt",
    pets: "Haustiere willkommen nach Voranfrage - CHF 25/Nacht Aufpreis",
    parties: "Ruhezone ab 22:00 Uhr - Respekt vor Nachbarn erforderlich",
    visitors: "Tagesgäste willkommen, Übernachtungsgäste müssen angemeldet werden",
    cancellation: "Kostenlose Stornierung bis 24 Stunden vor Anreise",
    payment: "Kreditkarte, PayPal, Banküberweisung, TWINT akzeptiert",
    damage: "Sicherheitskaution CHF 200 bei Ankunft (Rückzahlung bei einwandfreier Übergabe)",
    keyLoss: "Verlust von Schlüsseln: CHF 150 Ersatzgebühr"
  },
  
  // Notfall & Support
  emergency: {
    contact24h: "+41 79 123 45 67 (24/7 Notfall-Hotline für Gäste)",
    medical: {
      hospital: "Spital Interlaken (10 Minuten mit Taxi: +41 33 826 26 26)",
      pharmacy: "Notfall-Apotheke: Apotheke Dr. Bähler (+41 33 822 11 22)"
    },
    police: "Polizeistation Interlaken (5 Minuten zu Fuß: +41 33 827 20 20)",
    utilities: {
      power: "Elektrizitäts-Notdienst: +41 33 828 28 28",
      water: "Wasser-Notdienst: +41 33 829 29 29", 
      heating: "Heizungs-Notdienst: +41 79 888 77 66"
    },
    technical: "WLAN/TV-Probleme: +41 79 123 45 67 (auch außerhalb Bürozeiten)"
  },
  
  // Spezielle Services
  specialServices: {
    transfers: {
      airport: "Flughafen-Transfer auf Anfrage - CHF 180 (Zürich), CHF 95 (Bern)",
      train: "Abhol-Service vom Bahnhof auf Wunsch - CHF 15",
      taxi: "Taxi-Bestellung für Gäste - lokale Partner verfügbar"
    },
    concierge: {
      tickets: "Unterstützung bei Buchung von Ausflügen und Tickets",
      reservations: "Restaurant-Reservierungen für Gäste",
      recommendations: "Persönliche Beratung für Aktivitäten je nach Interesse"
    },
    groceries: {
      preShopping: "Grundausstattung-Einkauf vor Ankunft möglich (CHF 25 Service + Kosten)",
      delivery: "Supermarkt-Lieferung direkt ins Apartment organisierbar"
    }
  },
  
  // Häufige Probleme & Lösungen
  troubleshooting: {
    wifi: {
      problem: "WLAN funktioniert nicht",
      solutions: [
        "Router neu starten (Stecker ziehen, 30 Sek warten, einstecken)",
        "Gerät aus/ein schalten und neu verbinden", 
        "Bei weiterhin Problemen: +41 79 123 45 67 anrufen"
      ]
    },
    heating: {
      problem: "Heizung funktioniert nicht",
      solutions: [
        "Thermostat prüfen - sollte auf mindestens 20°C stehen",
        "Heizkörper-Ventil vollständig öffnen",
        "Bei Problemen: Notdienst +41 79 888 77 66"
      ]
    },
    tv: {
      problem: "TV/Smart TV Probleme", 
      solutions: [
        "TV ausschalten, 30 Sekunden warten, wieder einschalten",
        "HDMI-Kabel prüfen falls externes Gerät",
        "Netflix/Apps: Aus- und wieder einloggen"
      ]
    },
    keys: {
      problem: "Schlüssel vergessen/verloren",
      solutions: [
        "24h-Notfall-Hotline anrufen: +41 79 123 45 67",
        "Ersatzschlüssel verfügbar (CHF 150 Gebühr bei Verlust)",
        "Self-Check-in Code als Backup verfügbar"
      ]
    }
  },
  
  // Saison-spezifische Informationen
  seasonal: {
    summer: {
      period: "Juni - September",
      weather: "15-25°C, gelegentliche Gewitter nachmittags",
      clothing: "Leichte Kleidung, Regenjacke, feste Wanderschuhe",
      activities: "Wandern, Paragliding, Wassersport, Bergbahnen",
      tips: "Sonnencreme nicht vergessen! Bergwetter kann schnell umschlagen."
    },
    winter: {
      period: "Dezember - März", 
      weather: "-5 bis 5°C, Schnee ab 800m Höhe",
      clothing: "Warme Winterkleidung, wasserdichte Schuhe, Mütze/Handschuhe",
      activities: "Skifahren, Schneeschuhwandern, Winterwandern, Wellness",
      tips: "Rutschfeste Schuhe wichtig! Tageslicht nur bis 17:00."
    }
  }
};

// Häufig gestellte Fragen - Templates für Quick Responses
export const faqTemplates = {
  checkin: "Check-in ist von 15:00-20:00 Uhr. Self-Check-in mit Schlüsselbox möglich - Code wird 2h vor Ankunft gesendet.",
  wifi: "WLAN-Name: Heart-Interlaken-Guest. Passwort wird bei Check-in mitgeteilt. Bei Problemen: Router neu starten.",
  parking: "Parkplatz CHF 15/Nacht, 100m entfernt. Voranmeldung nötig! Gratis-Parken am Bahnhof (10 Min Fußweg).",
  restaurants: "Empfehlungen: Restaurant Taverne (Schweizer Küche, 2 Min), Pizzeria Horn (3 Min), Restaurant Bären (gehoben, 5 Min).",
  jungfraujoch: "Jungfraujoch: CHF 184 mit Gäste-Rabatt, 2h Fahrt. Wetter-abhängig - vorher checken!",
  emergency: "Notfall-Hotline 24/7: +41 79 123 45 67. Spital: 10 Min mit Taxi. Polizei: 5 Min zu Fuß."
};