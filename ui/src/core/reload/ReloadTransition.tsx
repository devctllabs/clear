import { useEffect, useState } from 'react'

import { consumeReloadTransition } from './lib'

export const ReloadTransition = () => {
  const [isMounted, setIsMounted] = useState(() => consumeReloadTransition())
  const [isFading, setIsFading] = useState(false)

  useEffect(() => {
    if (!isMounted) {
      return
    }

    const revealFrame = window.requestAnimationFrame(() => {
      setIsFading(true)
    })

    const hideTimer = window.setTimeout(() => {
      setIsMounted(false)
    }, 900)

    return () => {
      window.cancelAnimationFrame(revealFrame)
      window.clearTimeout(hideTimer)
    }
  }, [isMounted])

  if (!isMounted) {
    return null
  }

  return (
    <div
      aria-hidden="true"
      className={`app-reload-transition${isFading ? ' is-fading' : ''}`}
    />
  )
}
