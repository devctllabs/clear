/**
 * @vitest-environment jsdom
 */
import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ReloadTransition } from './ReloadTransition'
import { consumeReloadTransition, markReloadTransition } from './lib'

describe('ReloadTransition', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    window.sessionStorage.clear()
  })

  it('shows a one-shot overlay after a reload and then clears the flag', () => {
    markReloadTransition()

    render(<ReloadTransition />)

    expect(document.querySelector('.app-reload-transition')).toBeTruthy()

    act(() => {
      vi.advanceTimersByTime(960)
    })

    expect(document.querySelector('.app-reload-transition')).toBeNull()
    expect(consumeReloadTransition()).toBe(false)
  })
})
