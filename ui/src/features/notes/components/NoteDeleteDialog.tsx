import { ConfirmDialog } from '@shared/components/feedback/ConfirmDialog'
import { useTranslation } from 'react-i18next'

import type { NoteDetail } from '../types/note.types'

export const NoteDeleteDialog = ({
  actionError,
  confirming,
  note,
  open,
  onConfirm,
  onOpenChange,
}: {
  actionError: {
    error: unknown
    title: string
  } | null
  confirming: boolean
  note?: NoteDetail
  open: boolean
  onConfirm: () => void
  onOpenChange: (open: boolean) => void
}) => (
  <NoteDeleteDialogContent
    actionError={actionError}
    confirming={confirming}
    note={note}
    open={open}
    onConfirm={onConfirm}
    onOpenChange={onOpenChange}
  />
)

const NoteDeleteDialogContent = ({
  actionError,
  confirming,
  note,
  open,
  onConfirm,
  onOpenChange,
}: Parameters<typeof NoteDeleteDialog>[0]) => {
  const { t } = useTranslation()

  return (
    <ConfirmDialog
      actionError={actionError}
      confirmLabel={t(($) => $.notes.actions.deleteNote)}
      confirming={confirming}
      description={
        note
          ? t(($) => $.notes.dialogs.deleteNoteDescription, { title: note.title })
          : t(($) => $.notes.dialogs.deleteNoteFallbackDescription)
      }
      open={open}
      title={
        note
          ? t(($) => $.notes.dialogs.deleteNoteTitle, { title: note.title })
          : t(($) => $.notes.dialogs.deleteNoteFallbackTitle)
      }
      onConfirm={onConfirm}
      onOpenChange={onOpenChange}
    />
  )
}
