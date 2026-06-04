import type { SettingsNewCardsOrder } from '../types/settings.types'

export type SettingsLanguageOption = Readonly<{
  label: string
  value: string
}>

export const settingsLanguageOptions: SettingsLanguageOption[] = [
  { label: 'English (US)', value: 'en-US' },
  { label: 'English (UK)', value: 'en-GB' },
  { label: 'Spanish', value: 'es' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
  { label: 'Russian', value: 'ru' },
  { label: 'Italian', value: 'it' },
  { label: 'Portuguese (Brazil)', value: 'pt-BR' },
  { label: 'Portuguese (Portugal)', value: 'pt-PT' },
  { label: 'Japanese', value: 'ja' },
  { label: 'Chinese (Simplified)', value: 'zh-Hans' },
  { label: 'Chinese (Traditional)', value: 'zh-Hant' },
  { label: 'Korean', value: 'ko' },
  { label: 'Arabic', value: 'ar' },
  { label: 'Hindi', value: 'hi' },
  { label: 'Turkish', value: 'tr' },
  { label: 'Dutch', value: 'nl' },
  { label: 'Polish', value: 'pl' },
  { label: 'Swedish', value: 'sv' },
  { label: 'Greek', value: 'el' },
  { label: 'Hebrew', value: 'he' },
  { label: 'Indonesian', value: 'id' },
  { label: 'Vietnamese', value: 'vi' },
  { label: 'Thai', value: 'th' },
  { label: 'Ukrainian', value: 'uk' },
]

export const settingsNewCardsOrderOptions: Array<{
  label: string
  value: SettingsNewCardsOrder
}> = [
  { label: 'Before reviews', value: 'before_review' },
  { label: 'After reviews', value: 'after_review' },
  { label: 'Mixed', value: 'mixed' },
]
