import { describe, expect, it, vi } from 'vitest'

import { readJson, readSessionJson, writeJson, writeSessionJson } from './jsonStorage'

describe('jsonStorage', () => {
  it('reads and writes local storage JSON with fallbacks', () => {
    expect(readJson('missing-local', { theme: 'light' })).toEqual({ theme: 'light' })

    writeJson('settings-local', { theme: 'dark' })
    expect(window.localStorage.getItem('settings-local')).toBe('{"theme":"dark"}')
    expect(readJson('settings-local', { theme: 'light' })).toEqual({ theme: 'dark' })

    window.localStorage.setItem('settings-local', '{broken')
    expect(readJson('settings-local', { theme: 'light' })).toEqual({ theme: 'light' })
  })

  it('reads and writes session storage JSON with fallbacks', () => {
    expect(readSessionJson('missing-session', ['fallback'])).toEqual(['fallback'])

    writeSessionJson('session-draft', ['draft'])
    expect(window.sessionStorage.getItem('session-draft')).toBe('["draft"]')
    expect(readSessionJson('session-draft', [])).toEqual(['draft'])

    window.sessionStorage.setItem('session-draft', '{broken')
    expect(readSessionJson('session-draft', [])).toEqual([])
  })

  it('falls back when browser storage is unavailable', () => {
    const browserWindow = window

    try {
      vi.stubGlobal('window', undefined)

      expect(readJson('server-local', { ok: true })).toEqual({ ok: true })
      expect(readSessionJson('server-session', ['fallback'])).toEqual(['fallback'])
      expect(() => {
        writeJson('server-local', { ok: true })
        writeSessionJson('server-session', ['draft'])
      }).not.toThrow()
    } finally {
      vi.stubGlobal('window', browserWindow)
    }
  })
})
