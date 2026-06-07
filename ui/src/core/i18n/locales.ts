export const defaultLocale = 'en-US'

export const publicLocales = [
  defaultLocale,
  'es',
  'pt-BR',
  'fr',
  'de',
  'ja',
  'zh-Hans',
  'zh-Hant',
  'ko',
  'id',
  'ru',
  'it',
  'nl',
  'tr',
  'pl',
  'vi',
  'cs',
  'uk',
  'hu',
  'sv',
  'ro',
  'el',
  'da',
  'fi',
  'sk',
  'bg',
  'th',
  'hr',
  'nb',
  'sr-Latn',
  'lt',
  'sl',
  'ca',
  'et',
  'lv',
  'bs',
  'fa',
  'ar',
  'he',
] as const

export type PublicLocale = (typeof publicLocales)[number]
export type LocaleDirection = 'ltr' | 'rtl'

export const rtlLocales = ['fa', 'ar', 'he'] satisfies readonly PublicLocale[]

export const isPublicLocale = (locale: string): locale is PublicLocale =>
  publicLocales.includes(locale as PublicLocale)

export const getLocaleDirection = (locale: string): LocaleDirection =>
  rtlLocales.includes(locale as (typeof rtlLocales)[number]) ? 'rtl' : 'ltr'

export const getDocumentLocale = (locale: string): PublicLocale =>
  isPublicLocale(locale) ? locale : defaultLocale
