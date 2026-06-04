import { useEffect, useState } from 'react'

export const useDelayedBoolean = (value: boolean, delayMs: number) => {
  const [delayedValue, setDelayedValue] = useState(() => value && delayMs <= 0)

  useEffect(() => {
    if (!value) {
      setDelayedValue(false)
      return
    }

    if (delayMs <= 0) {
      setDelayedValue(true)
      return
    }

    const timeout = window.setTimeout(() => {
      setDelayedValue(true)
    }, delayMs)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [delayMs, value])

  return delayedValue
}
