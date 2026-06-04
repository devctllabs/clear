import i18next, { type i18n, type InitOptions } from 'i18next'
import { initReactI18next } from 'react-i18next'

import { publicLocales, defaultLocale } from './locales'
import { defaultNamespace, resources } from './resources'

const initOptions = (locale: string): InitOptions => ({
  defaultNS: defaultNamespace,
  enableSelector: true,
  fallbackLng: defaultLocale,
  initAsync: false,
  interpolation: {
    escapeValue: false,
  },
  lng: locale,
  ns: [defaultNamespace],
  react: {
    useSuspense: false,
  },
  resources,
  returnNull: false,
  supportedLngs: publicLocales,
})

export const createAppI18n = (locale = defaultLocale): i18n => {
  const instance = i18next.createInstance()

  void instance.use(initReactI18next).init(initOptions(locale))

  return instance
}

export const appI18n = createAppI18n()
