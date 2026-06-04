import { useTranslation } from 'react-i18next'

import { ConfirmDialog } from '@shared/components/feedback/ConfirmDialog'

import { showSettingsLanguageControl } from '../constants/settings-ui'

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
}) => {
  const { t } = useTranslation()
  const description = showSettingsLanguageControl
    ? t(($) => $.settings.dialogs.resetDescriptionWithLanguage)
    : t(($) => $.settings.dialogs.resetDescription)

  return (
    <ConfirmDialog
      actionError={actionError}
      confirmLabel={t(($) => $.settings.actions.resetSettings)}
      confirming={confirming}
      description={description}
      open={open}
      title={t(($) => $.settings.dialogs.resetTitle)}
      onConfirm={onConfirm}
      onOpenChange={onOpenChange}
    />
  )
}
