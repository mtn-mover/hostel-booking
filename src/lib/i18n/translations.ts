import en from '../../../messages/en.json'
import de from '../../../messages/de.json'

export type Locale = 'en' | 'de'

export const defaultLocale: Locale = 'en'

export const locales: Locale[] = ['en', 'de']

export const localeNames: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch'
}

const translations: Record<Locale, typeof en> = {
  en,
  de
}

export function getTranslations(locale: Locale = defaultLocale) {
  return translations[locale] || translations[defaultLocale]
}

export function t(locale: Locale, key: string): string {
  const keys = key.split('.')
  let value: unknown = translations[locale] || translations[defaultLocale]

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k]
    } else {
      console.warn(`Translation key not found: ${key}`)
      return key
    }
  }

  return typeof value === 'string' ? value : key
}

export type TranslationKey =
  | `common.${keyof typeof en.common}`
  | `home.${keyof typeof en.home}`
  | `apartment.${keyof typeof en.apartment}`
  | `booking.${keyof typeof en.booking}`
  | `navigation.${keyof typeof en.navigation}`
  | `footer.${keyof typeof en.footer}`
