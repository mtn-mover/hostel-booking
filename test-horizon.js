// Quick test to check and update booking horizon
const apartment = {
  id: 'cmf4aplby000fujq0r1509971',
  bookingHorizon: '2027-01-31'
}

async function updateHorizon() {
  try {
    const response = await fetch('http://localhost:3001/api/admin/apartments/' + apartment.id, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: "Aversis Hideaway - Heart 5",
        description: "Gemütliches Apartment im Herzen der Stadt",
        shortDescription: "Zentral gelegen",
        maxGuests: 4,
        bedrooms: 2,
        beds: 3,
        bathrooms: 1,
        size: 65,
        price: 782,
        cleaningFee: 50,
        minStayNights: 1,
        maxStayNights: null,
        address: "Hauptstraße 5",
        city: "Zürich",
        country: "Switzerland",
        isActive: true,
        airbnbId: "24131251",
        airbnbUrl: "https://www.airbnb.ch/rooms/24131251",
        bookingHorizon: "2027-01-31"
      })
    })
    
    const data = await response.json()
    console.log('Updated apartment:', data)
    console.log('Booking horizon is now:', data.bookingHorizon)
  } catch (error) {
    console.error('Error:', error)
  }
}

updateHorizon()