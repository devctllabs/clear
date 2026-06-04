import { useLayoutEffect } from 'react'

export const visualViewportBottomOffsetVariable = '--visual-viewport-bottom-offset'

const keyboardViewportRatio = 0.75

const getVisualViewportBottomOffset = () => {
  const viewport = window.visualViewport

  if (!viewport || window.innerHeight <= 0) {
    return 0
  }

  if (viewport.height < window.innerHeight * keyboardViewportRatio) {
    return 0
  }

  return Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
}

const setVisualViewportBottomOffset = (offset: number) => {
  document.documentElement.style.setProperty(
    visualViewportBottomOffsetVariable,
    `${Math.round(offset)}px`,
  )
}

export const useVisualViewportBottomOffset = () => {
  useLayoutEffect(() => {
    const updateOffset = () => {
      setVisualViewportBottomOffset(getVisualViewportBottomOffset())
    }

    updateOffset()

    const viewport = window.visualViewport

    viewport?.addEventListener('resize', updateOffset)
    viewport?.addEventListener('scroll', updateOffset)
    window.addEventListener('orientationchange', updateOffset)
    window.addEventListener('resize', updateOffset)

    return () => {
      viewport?.removeEventListener('resize', updateOffset)
      viewport?.removeEventListener('scroll', updateOffset)
      window.removeEventListener('orientationchange', updateOffset)
      window.removeEventListener('resize', updateOffset)
      document.documentElement.style.removeProperty(visualViewportBottomOffsetVariable)
    }
  }, [])
}
