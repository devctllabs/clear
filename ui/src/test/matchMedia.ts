import { vi } from 'vitest'

export const mockMatchMedia = (matches: boolean) => {
  window.matchMedia = vi.fn((query: string) => ({
    addEventListener: vi.fn(),
    addListener: vi.fn(),
    dispatchEvent: vi.fn(),
    matches,
    media: query,
    onchange: null,
    removeEventListener: vi.fn(),
    removeListener: vi.fn(),
  })) as typeof window.matchMedia
}

