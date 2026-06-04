import { describe, expect, it, vi } from 'vitest'

import {
  initializeTheme,
  resetThemeStoreForTests,
  themeStorageKey,
  useThemeStore,
} from './themeStore'

const systemThemeQuery = '(prefers-color-scheme: dark)'

const mockControllableSystemTheme = (initialMatches: boolean) => {
  let matches = initialMatches
  const listeners = new Set<EventListener>()

  window.matchMedia = vi.fn((query: string) => ({
    addEventListener: (_type: string, listener: EventListener) => {
      listeners.add(listener)
    },
    addListener: vi.fn(),
    dispatchEvent: vi.fn(),
    matches,
    media: query,
    onchange: null,
    removeEventListener: (_type: string, listener: EventListener) => {
      listeners.delete(listener)
    },
    removeListener: vi.fn(),
  })) as typeof window.matchMedia

  return {
    setMatches(nextMatches: boolean) {
      matches = nextMatches
      listeners.forEach((listener) => {
        listener(new Event('change'))
      })
    },
  }
}

describe('theme store', () => {
  it('defaults to system preference and resolves the current system theme', () => {
    window.matchMedia = vi.fn((query: string) => ({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches: query === systemThemeQuery,
      media: query,
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    })) as typeof window.matchMedia

    resetThemeStoreForTests()

    expect(useThemeStore.getState()).toMatchObject({
      preference: 'system',
      resolvedTheme: 'dark',
    })
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
  })

  it('persists explicit theme preference and applies it to the document', () => {
    useThemeStore.getState().setPreference('dark')

    expect(useThemeStore.getState()).toMatchObject({
      preference: 'dark',
      resolvedTheme: 'dark',
    })
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    expect(window.localStorage.getItem(themeStorageKey)).toBe('dark')
  })

  it('initializes from a stored plain theme preference', () => {
    window.localStorage.setItem(themeStorageKey, 'dark')

    const dispose = initializeTheme()

    expect(useThemeStore.getState()).toMatchObject({
      preference: 'dark',
      resolvedTheme: 'dark',
    })
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')

    dispose()
  })

  it('falls back to system preference for invalid stored values', () => {
    window.localStorage.setItem(themeStorageKey, 'sepia')

    const dispose = initializeTheme()

    expect(useThemeStore.getState()).toMatchObject({
      preference: 'system',
      resolvedTheme: 'light',
    })
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')

    dispose()
  })

  it('updates the resolved theme when system mode changes', () => {
    const systemTheme = mockControllableSystemTheme(false)
    const dispose = initializeTheme()

    expect(useThemeStore.getState()).toMatchObject({
      preference: 'system',
      resolvedTheme: 'light',
    })
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')

    systemTheme.setMatches(true)

    expect(useThemeStore.getState().resolvedTheme).toBe('dark')
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')

    dispose()
  })
})
