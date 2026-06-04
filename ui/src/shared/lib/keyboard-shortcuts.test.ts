/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest'

import { matchesShortcutCombo } from './keyboard-shortcuts'

describe('matchesShortcutCombo', () => {
  it('matches primary on non-mac platforms', () => {
    const event = new KeyboardEvent('keydown', {
      ctrlKey: true,
      key: 'r',
    })

    expect(matchesShortcutCombo(event, { key: 'r', primary: true }, false)).toBe(true)
  })

  it('matches primary on mac platforms', () => {
    const event = new KeyboardEvent('keydown', {
      key: 'r',
      metaKey: true,
    })

    expect(matchesShortcutCombo(event, { key: 'r', primary: true }, true)).toBe(true)
  })

  it('rejects the wrong primary modifier for the platform', () => {
    const event = new KeyboardEvent('keydown', {
      ctrlKey: true,
      key: 'r',
    })

    expect(matchesShortcutCombo(event, { key: 'r', primary: true }, true)).toBe(false)
  })
})
