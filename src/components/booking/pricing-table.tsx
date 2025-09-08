'use client'

import { useState, useEffect } from 'react'
import { formatPrice } from '@/lib/utils'

interface PricingTableProps {
  apartment: {
    id: string
    price: number
  }
}

interface PricingData {
  duration: string
  nightlyRate: number
  totalPrice: number
  discount: number
  savings: number
}

export function PricingTable({ apartment }: PricingTableProps) {
  const apartmentId = apartment.id
  const basePrice = apartment.price
  const [pricingData, setPricingData] = useState<PricingData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPricingData = async () => {
      // If no apartment ID, use default pricing
      if (!apartmentId) {
        setPricingData(generateDefaultPricing())
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        // Get current date for calculations
        const today = new Date()
        const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
        
        const response = await fetch(
          `/api/apartments/${apartmentId}/pricing?` +
          `startDate=${today.toISOString().split('T')[0]}&` +
          `endDate=${nextMonth.toISOString().split('T')[0]}`
        )

        if (!response.ok) {
          console.error('Pricing API returned:', response.status, response.statusText)
          // Use default pricing if API fails
          setPricingData(generateDefaultPricing())
          setLoading(false)
          return
        }

        const data = await response.json()
        setPricingData(data.pricing || generateDefaultPricing())
      } catch (error) {
        console.error('Failed to fetch pricing data:', error)
        // Use default pricing on error
        setPricingData(generateDefaultPricing())
      } finally {
        setLoading(false)
      }
    }

    if (basePrice && basePrice > 0) {
      fetchPricingData()
    } else {
      // If no base price, show empty state
      setPricingData([])
      setLoading(false)
    }
  }, [apartmentId, basePrice])

  const generateDefaultPricing = (): PricingData[] => {
    // Check if basePrice is valid
    if (!basePrice || basePrice <= 0) {
      return []
    }

    // Generate pricing based on your discount structure
    const pricingTiers = [
      { duration: '1 Nacht', nights: 1, discount: 0 },
      { duration: '2 Nächte', nights: 2, discount: 0.15 },
      { duration: '3 Nächte', nights: 3, discount: 0.25 },
      { duration: '4+ Nächte', nights: 7, discount: 0.30 }
    ]

    return pricingTiers.map(tier => {
      const discountedRate = basePrice * (1 - tier.discount)
      const originalTotal = basePrice * tier.nights
      const discountedTotal = discountedRate * tier.nights
      
      return {
        duration: tier.duration,
        nightlyRate: discountedRate,
        totalPrice: discountedTotal,
        discount: tier.discount * 100,
        savings: originalTotal - discountedTotal
      }
    })
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preistabelle</h3>
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (pricingData.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preisstaffelung</h3>
        <p className="text-sm text-gray-600">
          Preisinformationen werden geladen...
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Preisstaffelung</h3>
      <p className="text-sm text-gray-600 mb-4">
        Je länger Sie bleiben, desto mehr sparen Sie!
      </p>
      
      <div className="space-y-3">
        {pricingData.map((pricing, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
          >
            <div className="flex-1">
              <div className="font-medium text-gray-900">
                {pricing.duration}
              </div>
              {pricing.discount > 0 && (
                <div className="text-sm text-green-600 font-medium">
                  {pricing.discount}% Rabatt
                </div>
              )}
            </div>
            
            <div className="text-right">
              <div className="font-semibold text-gray-900">
                {formatPrice(pricing.nightlyRate)} / Nacht
              </div>
              {pricing.savings > 0 && (
                <div className="text-sm text-green-600">
                  Spare {formatPrice(pricing.savings)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm text-blue-800 font-medium">
            Preise variieren je nach Saison und Verfügbarkeit
          </span>
        </div>
      </div>
    </div>
  )
}