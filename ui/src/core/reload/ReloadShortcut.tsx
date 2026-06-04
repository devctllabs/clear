import { useMemo } from 'react'

import { useKeyboardShortcuts } from '@shared/hooks/useKeyboardShortcuts'

import { reloadPage } from './lib'

export const ReloadShortcut = ({ onReload = reloadPage }: { onReload?: () => void }) => {
  const shortcuts = useMemo(
    () => [
      {
        combo: {
          key: 'r',
          primary: true,
        },
        handler: onReload,
      },
    ],
    [onReload],
  )

  useKeyboardShortcuts(shortcuts)

  return null
}
