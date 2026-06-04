import { defaultLocale } from '../locales'
import { enUS } from './en-US'

export const defaultNamespace = 'translation'

export const resources = {
  [defaultLocale]: {
    [defaultNamespace]: enUS,
  },
} as const

export type TranslationResources = (typeof resources)[typeof defaultLocale]
