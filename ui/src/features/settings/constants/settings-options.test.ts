import { describe, expect, it } from 'vitest'

import { publicLocales } from '@core/i18n'

import { settingsLanguageOptions } from './settings-options'

describe('settings options', () => {
  it('lists public locales with English language labels sorted alphabetically', () => {
    expect(settingsLanguageOptions).toEqual([
      { label: 'Arabic', value: 'ar' },
      { label: 'Bosnian', value: 'bs' },
      { label: 'Bulgarian', value: 'bg' },
      { label: 'Catalan', value: 'ca' },
      { label: 'Chinese (Simplified)', value: 'zh-Hans' },
      { label: 'Chinese (Traditional)', value: 'zh-Hant' },
      { label: 'Croatian', value: 'hr' },
      { label: 'Czech', value: 'cs' },
      { label: 'Danish', value: 'da' },
      { label: 'Dutch', value: 'nl' },
      { label: 'English', value: 'en-US' },
      { label: 'Estonian', value: 'et' },
      { label: 'Finnish', value: 'fi' },
      { label: 'French', value: 'fr' },
      { label: 'German', value: 'de' },
      { label: 'Greek', value: 'el' },
      { label: 'Hebrew', value: 'he' },
      { label: 'Hungarian', value: 'hu' },
      { label: 'Indonesian', value: 'id' },
      { label: 'Italian', value: 'it' },
      { label: 'Japanese', value: 'ja' },
      { label: 'Korean', value: 'ko' },
      { label: 'Latvian', value: 'lv' },
      { label: 'Lithuanian', value: 'lt' },
      { label: 'Norwegian Bokmål', value: 'nb' },
      { label: 'Persian', value: 'fa' },
      { label: 'Polish', value: 'pl' },
      { label: 'Portuguese (Brazil)', value: 'pt-BR' },
      { label: 'Romanian', value: 'ro' },
      { label: 'Russian', value: 'ru' },
      { label: 'Serbian', value: 'sr-Latn' },
      { label: 'Slovak', value: 'sk' },
      { label: 'Slovenian', value: 'sl' },
      { label: 'Spanish', value: 'es' },
      { label: 'Swedish', value: 'sv' },
      { label: 'Thai', value: 'th' },
      { label: 'Turkish', value: 'tr' },
      { label: 'Ukrainian', value: 'uk' },
      { label: 'Vietnamese', value: 'vi' },
    ])
    expect(settingsLanguageOptions.map((option) => option.label)).toEqual(
      settingsLanguageOptions
        .map((option) => option.label)
        .sort((left, right) => left.localeCompare(right)),
    )
    expect([...settingsLanguageOptions.map((option) => option.value)].sort()).toEqual(
      [...publicLocales].sort(),
    )
  })
})
