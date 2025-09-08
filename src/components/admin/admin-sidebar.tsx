'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/apartments', label: 'Apartments', icon: '🏠' },
  { href: '/admin/bookings', label: 'Bookings', icon: '📅' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/reviews', label: 'Reviews', icon: '⭐' },
  { href: '/admin/knowledge-base', label: 'Knowledge Base', icon: '📖' },
  { href: '/admin/training', label: 'Q&A Training', icon: '📚' },
  { href: '/admin/learning', label: 'Chat Learning', icon: '🤖' },
  { href: '/admin/chat-settings', label: 'Chat Settings', icon: '💬' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">HOSTLOPIA</h2>
        <p className="text-sm text-gray-600">Admin Management System</p>
      </div>
      
      <nav className="mt-8">
        {adminNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
              pathname === item.href
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span className="mr-3 text-lg">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-6 left-6">
        <Link
          href="/"
          className="flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <span className="mr-2">←</span>
          Back to Site
        </Link>
      </div>
    </div>
  )
}