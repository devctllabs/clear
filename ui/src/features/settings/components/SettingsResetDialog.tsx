import { ConfirmDialog } from '@shared/components/feedback/ConfirmDialog'

import { showSettingsLanguageControl } from '../constants/settings-ui'

const settingsResetDescription = showSettingsLanguageControl
  ? 'This restores language, timezone, study limits, and FSRS settings.'
  : 'This restores timezone, study limits, and FSRS settings.'

export const SettingsResetDialog = ({
  actionError,
  confirming,
  open,
  onConfirm,
  onOpenChange,
}: {
  actionError: {
    error: unknown
    title: string
  } | null
  confirming: boolean
  open: boolean
  onConfirm: () => void
  onOpenChange: (open: boolean) => void
}) => (
  <ConfirmDialog
    actionError={actionError}
    confirmLabel="Reset settings"
    confirming={confirming}
    description={settingsResetDescription}
    open={open}
    title="Reset all settings?"
    onConfirm={onConfirm}
    onOpenChange={onOpenChange}
  />
)
