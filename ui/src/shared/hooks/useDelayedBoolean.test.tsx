import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useDelayedBoolean } from './useDelayedBoolean'

describe('useDelayedBoolean', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('delays changing from false to true', () => {
    const { result, rerender } = renderHook(({ value }) => useDelayedBoolean(value, 180), {
      initialProps: { value: false },
    })

    expect(result.current).toBe(false)

    rerender({ value: true })
    expect(result.current).toBe(false)

    act(() => {
      vi.advanceTimersByTime(179)
    })
    expect(result.current).toBe(false)

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current).toBe(true)
  })

  it('returns false immediately and cancels pending true changes', () => {
    const { result, rerender } = renderHook(({ value }) => useDelayedBoolean(value, 180), {
      initialProps: { value: false },
    })

    rerender({ value: true })

    act(() => {
      vi.advanceTimersByTime(100)
    })

    rerender({ value: false })
    expect(result.current).toBe(false)

    act(() => {
      vi.advanceTimersByTime(80)
    })
    expect(result.current).toBe(false)
  })

  it('returns true immediately when delay is disabled', () => {
    const { result, rerender } = renderHook(({ value }) => useDelayedBoolean(value, 0), {
      initialProps: { value: false },
    })

    rerender({ value: true })

    expect(result.current).toBe(true)
  })
})
