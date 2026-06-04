import type { PropsWithChildren } from 'react'
import { I18nextProvider } from 'react-i18next'

import { appI18n } from './i18n'

import type { i18n } from 'i18next'

export const AppI18nProvider = ({
  children,
  i18n = appI18n,
}: PropsWithChildren<{ i18n?: i18n }>) => (
  <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
)
