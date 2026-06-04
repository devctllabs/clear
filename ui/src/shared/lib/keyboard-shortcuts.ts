export type ShortcutCombo = {
  alt?: boolean
  key: string
  primary?: boolean
  shift?: boolean
}

export type KeyboardShortcut = {
  combo: ShortcutCombo
  handler: () => void
}

const isMacPlatform = () => {
  if (typeof navigator === 'undefined') {
    return false
  }

  const platform =
    (
      navigator as Navigator & {
        userAgentData?: { platform?: string }
      }
    ).userAgentData?.platform ?? navigator.userAgent

  return /Mac|iPhone|iPad|iPod/i.test(platform)
}

const matchesModifier = (expected: boolean | undefined, actual: boolean) => {
  if (expected === undefined) {
    return true
  }

  return expected === actual
}

export const matchesShortcutCombo = (
  event: KeyboardEvent,
  combo: ShortcutCombo,
  platformIsMac = isMacPlatform(),
) => {
  if (event.key.toLowerCase() !== combo.key.toLowerCase()) {
    return false
  }

  const primaryPressed = platformIsMac ? event.metaKey : event.ctrlKey

  return (
    matchesModifier(combo.primary, primaryPressed) &&
    matchesModifier(combo.alt, event.altKey) &&
    matchesModifier(combo.shift, event.shiftKey)
  )
}
