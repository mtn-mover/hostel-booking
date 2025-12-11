import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

async function createApartment(formData: FormData) {
  'use server'
  
  const title = formData.get('title') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const shortDescription = formData.get('shortDescription') as string
  const price = parseFloat(formData.get('price') as string)
  const cleaningFee = parseFloat(formData.get('cleaningFee') as string)
  const maxGuests = parseInt(formData.get('maxGuests') as string)
  const bedrooms = parseInt(formData.get('bedrooms') as string)
  const beds = parseInt(formData.get('beds') as string)
  const bathrooms = parseInt(formData.get('bathrooms') as string)
  const minStayNights = parseInt(formData.get('minStayNights') as string)
  const maxStayNights = formData.get('maxStayNights') ? parseInt(formData.get('maxStayNights') as string) : null
  const airbnbId = formData.get('airbnbId') as string
  const airbnbUrl = formData.get('airbnbUrl') as string
  
  const apartment = await prisma.apartment.create({
    data: {
      title: title || name,
      name,
      description,
      shortDescription: shortDescription || description.substring(0, 150),
      price,
      cleaningFee,
      maxGuests,
      bedrooms,
      beds,
      bathrooms,
      minStayNights,
      maxStayNights,
      airbnbId: airbnbId || null,
      airbnbUrl: airbnbUrl || null,
      isActive: true,
      images: '[]',
      amenities: '[]'
    }
  })
  
  revalidatePath('/admin/apartments')
  redirect(`/admin/apartments/${apartment.id}`)
}

export default async function NewApartmentPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Apartment</h1>
        <p className="mt-2 text-gray-600">Create a new apartment listing</p>
      </div>

      {/* Form */}
      <form action={createApartment} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  placeholder="e.g. Cozy Alpine Studio"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Internal Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder="e.g. Studio A1"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                placeholder="Detailed description of the apartment..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Short Description
              </label>
              <input
                type="text"
                id="shortDescription"
                name="shortDescription"
                placeholder="Brief description for listings"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Property Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="maxGuests" className="block text-sm font-medium text-gray-700 mb-1">
                Max Guests *
              </label>
              <input
                type="number"
                id="maxGuests"
                name="maxGuests"
                required
                min="1"
                defaultValue="2"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
                Bedrooms *
              </label>
              <input
                type="number"
                id="bedrooms"
                name="bedrooms"
                required
                min="0"
                defaultValue="1"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="beds" className="block text-sm font-medium text-gray-700 mb-1">
                Beds *
              </label>
              <input
                type="number"
                id="beds"
                name="beds"
                required
                min="1"
                defaultValue="1"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">
                Bathrooms *
              </label>
              <input
                type="number"
                id="bathrooms"
                name="bathrooms"
                required
                min="0"
                step="0.5"
                defaultValue="1"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Hidden default values for pricing (temporarily hidden) */}
        <input type="hidden" name="price" value="0" />
        <input type="hidden" name="cleaningFee" value="0" />
        <input type="hidden" name="minStayNights" value="1" />

        {/* Airbnb Integration */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Airbnb Integration (Optional)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="airbnbId" className="block text-sm font-medium text-gray-700 mb-1">
                Airbnb ID
              </label>
              <input
                type="text"
                id="airbnbId"
                name="airbnbId"
                placeholder="12345678"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="airbnbUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Airbnb URL
              </label>
              <input
                type="url"
                id="airbnbUrl"
                name="airbnbUrl"
                placeholder="https://www.airbnb.com/rooms/..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <a
            href="/admin/apartments"
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </a>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Create Apartment
          </button>
        </div>
      </form>
    </div>
  )
}