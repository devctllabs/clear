import { ConfirmDialog } from '@shared/components/feedback/ConfirmDialog'

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
  <ConfirmDialog
    actionError={actionError}
    confirmLabel="Delete note"
    confirming={confirming}
    description={note ? `This moves "${note.title}" to Trash. You can restore it later.` : ''}
    open={open}
    title={note ? `Delete "${note.title}"?` : 'Delete note?'}
    onConfirm={onConfirm}
    onOpenChange={onOpenChange}
  />
)
