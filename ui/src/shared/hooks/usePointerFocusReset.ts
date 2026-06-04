import {
  useCallback,
  useRef,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type PointerEventHandler,
} from 'react'

type UsePointerFocusResetOptions<T extends HTMLElement> = {
  disabled?: boolean
  onClick?: MouseEventHandler<T>
  onKeyDown?: KeyboardEventHandler<T>
  onPointerDown?: PointerEventHandler<T>
}

export const usePointerFocusReset = <T extends HTMLElement = HTMLElement>({
  disabled = false,
  onClick,
  onKeyDown,
  onPointerDown,
}: UsePointerFocusResetOptions<T> = {}) => {
  const pointerActivationRef = useRef(false)

  const handlePointerDown = useCallback<PointerEventHandler<T>>(
    (event) => {
      pointerActivationRef.current = true
      onPointerDown?.(event)
    },
    [onPointerDown],
  )

  const handleKeyDown = useCallback<KeyboardEventHandler<T>>(
    (event) => {
      pointerActivationRef.current = false
      onKeyDown?.(event)
    },
    [onKeyDown],
  )

  const handleClick = useCallback<MouseEventHandler<T>>(
    (event) => {
      const target = event.currentTarget
      const shouldResetFocus = pointerActivationRef.current && !disabled
      pointerActivationRef.current = false

      onClick?.(event)

      if (!shouldResetFocus) {
        return
      }

      const ownerWindow = target.ownerDocument.defaultView

      ownerWindow?.requestAnimationFrame(() => {
        if (target.ownerDocument.activeElement === target) {
          target.blur()
        }
      })
    },
    [disabled, onClick],
  )

  return {
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    onPointerDown: handlePointerDown,
  }
}
