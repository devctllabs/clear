import type { defaultNamespace, TranslationResources } from './resources'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNamespace
    enableSelector: true
    resources: TranslationResources
    returnNull: false
  }
}
