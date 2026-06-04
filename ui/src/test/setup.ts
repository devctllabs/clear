import '@testing-library/jest-dom/vitest'

import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

import { queryClient } from '@core/query/query-client'
import { resetThemeStoreForTests } from '@core/theme'
import { mockAppDataStore } from '@platform/mock/mockAppDataStore'

vi.mock('lucide-react/dynamic', async () => {
  const React = await import('react')

  return {
    DynamicIcon: ({
      fallback,
      name,
      ...props
    }: {
      className?: string
      fallback?: () => React.ReactElement | null
      name: string
    }) => {
      void fallback

      return React.createElement('svg', { ...props, 'aria-hidden': true, 'data-icon': name })
    },
    iconNames: [
      'archive',
      'brain',
      'flask-conical',
      'globe',
      'graduation-cap',
      'languages',
      'layers-3',
      'shapes',
      'sparkles',
    ],
  }
})

window.scrollTo = (() => undefined) as typeof window.scrollTo

const createMatchMediaMock = (matches = false) =>
  ((query: string) => ({
    addEventListener: vi.fn(),
    addListener: vi.fn(),
    dispatchEvent: vi.fn(),
    matches,
    media: query,
    onchange: null,
    removeEventListener: vi.fn(),
    removeListener: vi.fn(),
  })) as typeof window.matchMedia

window.matchMedia = createMatchMediaMock()

class ResizeObserverMock {
  disconnect() {}
  observe() {}
  unobserve() {}
}

window.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver

beforeEach(() => {
  window.matchMedia = createMatchMediaMock()
  window.localStorage.clear()
  window.sessionStorage.clear()
  resetThemeStoreForTests()
  mockAppDataStore.reset()
  queryClient.clear()
})

afterEach(() => {
  vi.useRealTimers()
  cleanup()
})
