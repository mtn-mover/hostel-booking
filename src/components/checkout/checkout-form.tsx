'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  PaymentElement,
  useElements,
  useStripe
} from '@stripe/react-stripe-js'
import { formatPrice } from '@/lib/utils'

interface CheckoutFormProps {
  clientSecret?: string
  bookingId?: string
  totalPrice: number
  onGuestInfoSubmit?: (guestInfo: GuestInfo) => void
}

interface GuestInfo {
  name: string
  email: string
  phone: string
  specialRequests: string
}

export function CheckoutForm({ clientSecret, bookingId, totalPrice, onGuestInfoSubmit }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    name: '',
    email: '',
    phone: '',
    specialRequests: ''
  })

  useEffect(() => {
    if (!stripe || !clientSecret) {
      return
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      if (!paymentIntent) return

      switch (paymentIntent.status) {
        case "succeeded":
          setMessage("Payment succeeded!")
          // Redirect to confirmation page after a delay
          setTimeout(() => {
            router.push(`/booking/confirmation?bookingId=${bookingId}`)
          }, 2000)
          break
        case "processing":
          setMessage("Your payment is processing.")
          break
        case "requires_payment_method":
          setMessage("Your payment was not successful, please try again.")
          break
        default:
          setMessage("Something went wrong.")
          break
      }
    })
  }, [stripe, clientSecret, bookingId, router])

  const handleGuestInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!guestInfo.name || !guestInfo.email) {
      setMessage('Please fill in all required fields')
      return
    }

    if (onGuestInfoSubmit) {
      onGuestInfoSubmit(guestInfo)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)
    setMessage('')

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/booking/confirmation?bookingId=${bookingId}`,
      },
    })

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message || 'An error occurred')
      } else {
        setMessage("An unexpected error occurred.")
      }
    }

    setIsLoading(false)
  }

  // If no client secret, show guest information form
  if (!clientSecret) {
    return (
      <form onSubmit={handleGuestInfoSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={guestInfo.name}
            onChange={(e) => setGuestInfo(prev => ({ ...prev, name: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={guestInfo.email}
            onChange={(e) => setGuestInfo(prev => ({ ...prev, email: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            value={guestInfo.phone}
            onChange={(e) => setGuestInfo(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Special Requests
          </label>
          <textarea
            value={guestInfo.specialRequests}
            onChange={(e) => setGuestInfo(prev => ({ ...prev, specialRequests: e.target.value }))}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Any special requests or notes for your stay..."
          />
        </div>

        {message && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {message}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Continue to Payment
        </button>
      </form>
    )
  }

  const paymentElementOptions = {
    layout: 'tabs' as const
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement options={paymentElementOptions} />
      
      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.includes('succeeded') 
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex justify-between items-center text-lg font-semibold">
          <span>Total Amount:</span>
          <span>{formatPrice(totalPrice)}</span>
        </div>

        <button
          type="submit"
          disabled={isLoading || !stripe || !elements}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="availability-loading mr-2"></div>
              Processing payment...
            </div>
          ) : (
            `Pay ${formatPrice(totalPrice)}`
          )}
        </button>

        <div className="text-center text-sm text-gray-500">
          <p>Your payment information is secure and encrypted</p>
        </div>
      </div>
    </form>
  )
}