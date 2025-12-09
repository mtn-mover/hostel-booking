'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Apartment {
  id: string
  title: string
  description: string
  price: number
  location: string
  maxGuests: number
  bedrooms: number
  bathrooms: number
  isActive: boolean
  createdAt: string
  apartmentImages: { url: string }[]
  _count: {
    bookings: number
    reviews: number
  }
}

export default function AdminApartments() {
  const router = useRouter()
  const [apartments, setApartments] = useState<Apartment[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchApartments()
  }, [])

  const fetchApartments = async () => {
    try {
      const response = await fetch('/api/admin/apartments')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setApartments(data)
    } catch (error) {
      console.error('Error fetching apartments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return
    }

    setDeletingId(id)
    try {
      const response = await fetch(`/api/admin/apartments/${id}/delete`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || 'Failed to delete apartment')
        return
      }

      // Remove from list
      setApartments(prev => prev.filter(apt => apt.id !== id))
      alert('Apartment deleted successfully')
    } catch (error) {
      console.error('Error deleting apartment:', error)
      alert('Failed to delete apartment')
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/apartments/${id}/toggle-active`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (!response.ok) throw new Error('Failed to update')

      setApartments(prev => prev.map(apt => 
        apt.id === id ? { ...apt, isActive: !currentStatus } : apt
      ))
    } catch (error) {
      console.error('Error toggling status:', error)
      alert('Failed to update apartment status')
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading apartments...</div>
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Apartments</h1>
          <p className="mt-2 text-gray-600">Manage your apartment listings</p>
        </div>
        <Link
          href="/admin/apartments/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Add New Apartment
        </Link>
      </div>

      {/* Apartments Grid */}
      <div className="bg-white rounded-lg shadow">
        {apartments.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">No apartments yet</p>
            <Link
              href="/admin/apartments/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Add Your First Apartment
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Apartment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {apartments.map((apartment) => (
                  <tr key={apartment.id} className={deletingId === apartment.id ? 'opacity-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {apartment.apartmentImages[0] && (
                          <img
                            src={apartment.apartmentImages[0].url}
                            alt={apartment.title}
                            className="w-12 h-12 rounded-lg object-cover mr-4"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {apartment.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {apartment.bedrooms} bed • {apartment.bathrooms} bath • {apartment.maxGuests} guests
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {apartment.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{apartment._count.bookings} bookings</div>
                      <div>{apartment._count.reviews} reviews</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(apartment.id, apartment.isActive)}
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${
                          apartment.isActive
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {apartment.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link
                        href={`/admin/apartments/${apartment.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/apartments/${apartment.id}`}
                        className="text-green-600 hover:text-green-900"
                        target="_blank"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDelete(apartment.id, apartment.title)}
                        disabled={deletingId === apartment.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        {deletingId === apartment.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}