import { afterEach, describe, expect, it, vi } from 'vitest'

import { getInitialRuntimeProfile } from './runtime-profile'

const mockMatchMedia = (matchesByQuery: Record<string, boolean>) => {
  window.matchMedia = vi.fn((query: string) => ({
    addEventListener: vi.fn(),
    addListener: vi.fn(),
    dispatchEvent: vi.fn(),
    matches: matchesByQuery[query] ?? false,
    media: query,
    onchange: null,
    removeEventListener: vi.fn(),
    removeListener: vi.fn(),
  })) as typeof window.matchMedia
}

const mockMaxTouchPoints = (maxTouchPoints: number) => {
  Object.defineProperty(navigator, 'maxTouchPoints', {
    configurable: true,
    value: maxTouchPoints,
  })
}

describe('runtime profile detection', () => {
  afterEach(() => {
    delete window.__TAURI_INTERNALS__
    Reflect.deleteProperty(navigator, 'maxTouchPoints')
    vi.restoreAllMocks()
  })

  it('treats fine pointer web runtimes as desktop without using viewport width', () => {
    mockMatchMedia({
      '(hover: hover) and (pointer: fine)': true,
      '(min-width: 1024px)': false,
    })

    expect(getInitialRuntimeProfile()).toEqual({
      formFactor: 'desktop',
      runtime: 'web',
    })
  })

  it('treats touch-only web runtimes as mobile', () => {
    mockMaxTouchPoints(5)
    mockMatchMedia({
      '(hover: none) and (pointer: coarse)': true,
    })

    expect(getInitialRuntimeProfile()).toEqual({
      formFactor: 'mobile',
      runtime: 'web',
    })
  })

  it('does not assume every Tauri runtime is desktop', () => {
    window.__TAURI_INTERNALS__ = {}
    mockMaxTouchPoints(5)
    mockMatchMedia({
      '(hover: none) and (pointer: coarse)': true,
    })

    expect(getInitialRuntimeProfile()).toEqual({
      formFactor: 'mobile',
      runtime: 'tauri',
    })
  })
})
