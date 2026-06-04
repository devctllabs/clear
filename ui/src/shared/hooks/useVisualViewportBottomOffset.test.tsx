import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  useVisualViewportBottomOffset,
  visualViewportBottomOffsetVariable,
} from './useVisualViewportBottomOffset'

type VisualViewportEventName = 'resize' | 'scroll'

const originalInnerHeightDescriptor = Object.getOwnPropertyDescriptor(window, 'innerHeight')
const originalVisualViewportDescriptor = Object.getOwnPropertyDescriptor(
  window,
  'visualViewport',
)

const restoreWindowProperty = (
  key: 'innerHeight' | 'visualViewport',
  descriptor: PropertyDescriptor | undefined,
) => {
  if (descriptor) {
    Object.defineProperty(window, key, descriptor)
    return
  }

  Reflect.deleteProperty(window, key)
}

const installVisualViewport = ({
  height,
  innerHeight = 800,
  offsetTop = 0,
}: {
  height: number
  innerHeight?: number
  offsetTop?: number
}) => {
  const listeners: Partial<Record<VisualViewportEventName, EventListener>> = {}
  const viewport = {
    addEventListener: vi.fn((event: VisualViewportEventName, listener: EventListener) => {
      listeners[event] = listener
    }),
    height,
    offsetTop,
    removeEventListener: vi.fn((event: VisualViewportEventName, listener: EventListener) => {
      if (listeners[event] === listener) {
        delete listeners[event]
      }
    }),
  } as unknown as VisualViewport

  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    value: innerHeight,
  })
  Object.defineProperty(window, 'visualViewport', {
    configurable: true,
    value: viewport,
  })

  return {
    emit(event: VisualViewportEventName) {
      listeners[event]?.(new Event(event))
    },
    setHeight(nextHeight: number) {
      Object.defineProperty(viewport, 'height', {
        configurable: true,
        value: nextHeight,
      })
    },
    viewport,
  }
}

describe('useVisualViewportBottomOffset', () => {
  afterEach(() => {
    restoreWindowProperty('innerHeight', originalInnerHeightDescriptor)
    restoreWindowProperty('visualViewport', originalVisualViewportDescriptor)
    document.documentElement.style.removeProperty(visualViewportBottomOffsetVariable)
    vi.restoreAllMocks()
  })

  it('uses a zero offset when visualViewport is unavailable', () => {
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: undefined,
    })

    renderHook(() => useVisualViewportBottomOffset())

    expect(
      document.documentElement.style.getPropertyValue(visualViewportBottomOffsetVariable),
    ).toBe('0px')
  })

  it('updates the CSS variable from the visible viewport bottom inset', () => {
    const visualViewport = installVisualViewport({ height: 740, innerHeight: 800 })
    const { unmount } = renderHook(() => useVisualViewportBottomOffset())

    expect(
      document.documentElement.style.getPropertyValue(visualViewportBottomOffsetVariable),
    ).toBe('60px')
    expect(visualViewport.viewport.addEventListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function),
    )
    expect(visualViewport.viewport.addEventListener).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function),
    )

    act(() => {
      visualViewport.setHeight(720)
      visualViewport.emit('resize')
    })

    expect(
      document.documentElement.style.getPropertyValue(visualViewportBottomOffsetVariable),
    ).toBe('80px')

    unmount()
    expect(visualViewport.viewport.removeEventListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function),
    )
    expect(visualViewport.viewport.removeEventListener).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function),
    )
    expect(
      document.documentElement.style.getPropertyValue(visualViewportBottomOffsetVariable),
    ).toBe('')
  })

  it('does not raise bottom navigation above the on-screen keyboard', () => {
    installVisualViewport({ height: 520, innerHeight: 800 })

    renderHook(() => useVisualViewportBottomOffset())

    expect(
      document.documentElement.style.getPropertyValue(visualViewportBottomOffsetVariable),
    ).toBe('0px')
  })
})
