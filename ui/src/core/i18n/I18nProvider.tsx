import { useEffect, type PropsWithChildren } from 'react'
import { I18nextProvider } from 'react-i18next'

import { appI18n } from './i18n'
import { getDocumentLocale, getLocaleDirection } from './locales'

import type { i18n } from 'i18next'

const syncDocumentLocale = (language: string) => {
  const locale = getDocumentLocale(language)

  document.documentElement.lang = locale
  document.documentElement.dir = getLocaleDirection(locale)
}

const I18nDocumentMetadata = ({ i18n }: { i18n: i18n }) => {
  useEffect(() => {
    syncDocumentLocale(i18n.resolvedLanguage ?? i18n.language)

    const handleLanguageChanged = (language: string) => {
      syncDocumentLocale(language)
    }

    i18n.on('languageChanged', handleLanguageChanged)

    return () => {
      i18n.off('languageChanged', handleLanguageChanged)
    }
  }, [i18n])

  return null
}

export const AppI18nProvider = ({
  children,
  i18n = appI18n,
}: PropsWithChildren<{ i18n?: i18n }>) => (
  <I18nextProvider i18n={i18n}>
    <I18nDocumentMetadata i18n={i18n} />
    {children}
  </I18nextProvider>
)
