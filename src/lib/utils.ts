import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF'
  }).format(price)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('de-CH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

export function calculateNights(checkIn: Date, checkOut: Date): number {
  const diffTime = checkOut.getTime() - checkIn.getTime()
  const nights = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(1, nights) // Ensure at least 1 night
}

export function getDiscountForNights(nights: number): number {
  // Your discount structure: 1 night = 0%, 2 nights = 15%, 3 nights = 25%, 4+ nights = 30%
  if (nights === 1) return 0
  if (nights === 2) return 0.15
  if (nights === 3) return 0.25
  if (nights >= 4) return 0.30
  return 0
}

export function calculateDiscountedPrice(basePrice: number, nights: number): number {
  const discount = getDiscountForNights(nights)
  const discountedNightlyRate = basePrice * (1 - discount)
  return discountedNightlyRate * nights
}