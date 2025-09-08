import Link from 'next/link'

export default function BecomeHostPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Become a Host on HOSTLOPIA
            </h1>
            <p className="text-xl text-gray-600">
              Share your space and earn extra income
            </p>
          </div>

          {/* Benefits */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6">Why Host with HOSTLOPIA?</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-xl">💰</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-lg">Earn Extra Income</h3>
                  <p className="text-gray-600">Turn your extra space into a steady source of income</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-xl">🛡️</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-lg">Host Protection</h3>
                  <p className="text-gray-600">We provide host protection and support throughout your journey</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 text-xl">🎯</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-lg">Easy Management</h3>
                  <p className="text-gray-600">Simple tools to manage bookings, pricing, and availability</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 text-xl">🌍</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-lg">Global Reach</h3>
                  <p className="text-gray-600">Connect with travelers from around the world</p>
                </div>
              </div>
            </div>
          </div>

          {/* How it Works */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6">How It Works</h2>
            <div className="space-y-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold">Create Your Listing</h3>
                  <p className="text-gray-600">Add photos, describe your space, and set your price</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold">Welcome Guests</h3>
                  <p className="text-gray-600">Accept bookings and welcome travelers to your space</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold">Get Paid</h3>
                  <p className="text-gray-600">Receive secure payments directly to your account</p>
                </div>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6">Host Requirements</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>A clean, safe, and comfortable space for guests</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Accurate photos and descriptions of your listing</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Responsive communication with guests</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Compliance with local laws and regulations</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Commitment to providing great hospitality</span>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Ready to Start Hosting?
            </h2>
            <p className="text-white/90 mb-6">
              Join our community of hosts and start earning today
            </p>
            <div className="space-y-4">
              <p className="text-white/80 text-sm">
                Contact us at <a href="mailto:host@hostlopia.com" className="underline">host@hostlopia.com</a> to get started
              </p>
              <p className="text-white/80 text-sm">
                or call us at <a href="tel:+41123456789" className="underline">+41 12 345 67 89</a>
              </p>
            </div>
          </div>

          {/* Back Link */}
          <div className="text-center mt-8">
            <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}