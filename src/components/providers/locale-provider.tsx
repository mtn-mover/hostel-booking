'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Locale, defaultLocale, getTranslations, t as translate } from '@/lib/i18n'

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
  translations: ReturnType<typeof getTranslations>
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

interface LocaleProviderProps {
  children: ReactNode
  initialLocale?: Locale
}

export function LocaleProvider({ children, initialLocale = defaultLocale }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    // Save to localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale)
    }
  }, [])

  const t = useCallback((key: string) => {
    return translate(locale, key)
  }, [locale])

  const translations = getTranslations(locale)

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, translations }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}

export function useTranslations() {
  const { t, translations } = useLocale()
  return { t, translations }
}
