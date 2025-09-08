import Image from 'next/image'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-5xl font-bold mb-4">About HOSTLOPIA</h1>
            <p className="text-xl max-w-2xl mx-auto">
              Your trusted partner for premium hostel and apartment bookings in Interlaken and the Jungfrau region
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        {/* Our Story */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Story</h2>
          <div className="prose prose-lg mx-auto text-gray-600">
            <p className="mb-4">
              Founded with a passion for hospitality and a love for the Swiss Alps, HOSTLOPIA has been connecting 
              travelers with exceptional accommodations in Interlaken since our inception. We understand that finding 
              the perfect place to stay is crucial to creating unforgettable travel memories.
            </p>
            <p className="mb-4">
              Nestled in the heart of Switzerland, Interlaken serves as the gateway to the stunning Jungfrau region. 
              Our carefully curated selection of apartments and hostels offers something for every traveler - from 
              budget-conscious backpackers to families seeking comfort and convenience.
            </p>
            <p>
              What sets us apart is our commitment to quality, transparency, and personalized service. Every property 
              in our portfolio is personally vetted to ensure it meets our high standards for cleanliness, comfort, 
              and location.
            </p>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Choose HOSTLOPIA?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🏔️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Prime Locations</h3>
              <p className="text-gray-600">
                All our properties are strategically located near major attractions, transportation hubs, and the breathtaking Alpine scenery.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✨</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Assured</h3>
              <p className="text-gray-600">
                Every apartment and hostel is thoroughly inspected and must meet our strict quality standards before being listed.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Best Value</h3>
              <p className="text-gray-600">
                We offer competitive pricing with no hidden fees. Plus, enjoy special discounts for longer stays.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🛡️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Booking</h3>
              <p className="text-gray-600">
                Your bookings are protected with secure payment processing and comprehensive cancellation policies.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🤝</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Local Expertise</h3>
              <p className="text-gray-600">
                Our team has extensive knowledge of the region and can help you make the most of your stay.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⭐</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Guest Reviews</h3>
              <p className="text-gray-600">
                Read authentic reviews from real guests to make informed decisions about your accommodation.
              </p>
            </div>
          </div>
        </div>

        {/* The Region */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Discover Interlaken & Jungfrau</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-gray-600 mb-4">
                Interlaken, literally meaning "between lakes," sits majestically between Lake Thun and Lake Brienz. 
                This adventure capital of Switzerland offers year-round activities for every type of traveler.
              </p>
              <p className="text-gray-600 mb-4">
                From here, you can easily access the famous Jungfraujoch - the "Top of Europe," explore charming 
                mountain villages like Grindelwald and Lauterbrunnen, or enjoy countless outdoor activities including:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Hiking and mountain biking on scenic Alpine trails</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Paragliding over the stunning landscape</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Winter sports including skiing and snowboarding</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Lake activities and boat cruises</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>Historic cogwheel train journeys</span>
                </li>
              </ul>
            </div>
            <div className="relative h-96 rounded-lg overflow-hidden shadow-lg">
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center">
                <span className="text-6xl">🏔️</span>
              </div>
            </div>
          </div>
        </div>

        {/* Our Commitment */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">Our Commitment to You</h2>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg mb-4">
              At HOSTLOPIA, we're more than just a booking platform. We're your partners in creating memorable 
              Swiss Alpine experiences. Our commitment extends beyond just providing a place to sleep - we strive 
              to ensure every aspect of your accommodation enhances your journey.
            </p>
            <p className="text-lg">
              Whether you're seeking adventure, relaxation, or cultural exploration, we're here to help you find 
              the perfect base for your Interlaken adventure. Welcome to HOSTLOPIA - where your Swiss journey begins!
            </p>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Browse our selection of quality accommodations or get in touch with our team
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/" 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              View Accommodations
            </Link>
            <Link 
              href="/contact" 
              className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition font-semibold"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}