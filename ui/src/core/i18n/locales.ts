export const defaultLocale = 'en-US'

export const publicLocales = [defaultLocale] as const

export type PublicLocale = (typeof publicLocales)[number]

export const isPublicLocale = (locale: string): locale is PublicLocale =>
  publicLocales.includes(locale as PublicLocale)
