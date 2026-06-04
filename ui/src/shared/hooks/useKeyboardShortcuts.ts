import { useEffect, useRef } from 'react'

import {
  matchesShortcutCombo,
  type KeyboardShortcut,
} from '@shared/lib/keyboard-shortcuts'

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  const shortcutsRef = useRef(shortcuts)

  useEffect(() => {
    shortcutsRef.current = shortcuts
  }, [shortcuts])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcutsRef.current) {
        if (!matchesShortcutCombo(event, shortcut.combo)) {
          continue
        }

        event.preventDefault()
        shortcut.handler()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])
}
