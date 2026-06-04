import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { useFocusModalityTracking } from './useFocusModalityTracking'

const dispatchWindowEvent = (eventName: string) => {
  window.dispatchEvent(new Event(eventName, { bubbles: true }))
}

describe('useFocusModalityTracking', () => {
  afterEach(() => {
    delete document.documentElement.dataset.focusSource
  })

  it('marks keyboard focus after Tab and pointer focus after pointer input', () => {
    const { unmount } = renderHook(() => useFocusModalityTracking())

    expect(document.documentElement).toHaveAttribute('data-focus-source', 'pointer')

    window.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Tab' }))
    expect(document.documentElement).toHaveAttribute('data-focus-source', 'keyboard')

    dispatchWindowEvent('pointerdown')
    expect(document.documentElement).toHaveAttribute('data-focus-source', 'pointer')

    window.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }))
    expect(document.documentElement).toHaveAttribute('data-focus-source', 'pointer')

    unmount()
    expect(document.documentElement).not.toHaveAttribute('data-focus-source')
  })
})
