import { useEffect } from 'react'

type FocusSource = 'keyboard' | 'pointer'

const focusSourceDatasetKey = 'focusSource'

const setFocusSource = (source: FocusSource) => {
  if (document.documentElement.dataset[focusSourceDatasetKey] === source) {
    return
  }

  document.documentElement.dataset[focusSourceDatasetKey] = source
}

export const useFocusModalityTracking = () => {
  useEffect(() => {
    const previousFocusSource = document.documentElement.dataset[focusSourceDatasetKey]

    if (!previousFocusSource) {
      setFocusSource('pointer')
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        setFocusSource('keyboard')
      }
    }

    const handlePointerInput = () => {
      setFocusSource('pointer')
    }

    window.addEventListener('keydown', handleKeyDown, true)
    window.addEventListener('pointerdown', handlePointerInput, true)
    window.addEventListener('mousedown', handlePointerInput, true)
    window.addEventListener('touchstart', handlePointerInput, true)

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true)
      window.removeEventListener('pointerdown', handlePointerInput, true)
      window.removeEventListener('mousedown', handlePointerInput, true)
      window.removeEventListener('touchstart', handlePointerInput, true)

      if (previousFocusSource) {
        document.documentElement.dataset[focusSourceDatasetKey] = previousFocusSource
      } else {
        delete document.documentElement.dataset[focusSourceDatasetKey]
      }
    }
  }, [])
}
