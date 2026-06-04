import { describe, expect, it } from 'vitest'

import { createAppI18n, defaultLocale } from '@core/i18n'

describe('i18n', () => {
  it('creates an English i18next instance with typed selector resources', () => {
    const i18n = createAppI18n()

    expect(i18n.language).toBe(defaultLocale)
    expect(i18n.t(($) => $.decks.labels.due)).toBe('Due')
    expect(i18n.t(($) => $.decks.actions.openDeck, { title: 'Biology' })).toBe(
      'Open Biology deck',
    )
  })

  it('falls back to English for unsupported locales', () => {
    const i18n = createAppI18n('fr-FR')

    expect(i18n.t(($) => $.decks.labels.dueToday)).toBe('Due Today')
  })
})
