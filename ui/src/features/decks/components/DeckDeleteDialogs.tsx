import type { NoteListItem } from '@features/notes'
import { ConfirmDialog } from '@shared/components/feedback/ConfirmDialog'

import type { DeckDetail } from '../types/deck.types'

type ActionError = {
  error: unknown
  title: string
} | null

export const DeckDeleteDialogs = ({
  deckActionError,
  deletingDeck,
  deletingNote,
  noteActionError,
  pendingDeck,
  pendingNote,
  onCloseDeck,
  onCloseNote,
  onConfirmDeck,
  onConfirmNote,
}: {
  deckActionError: ActionError
  deletingDeck: boolean
  deletingNote: boolean
  noteActionError: ActionError
  pendingDeck: DeckDetail | null
  pendingNote: NoteListItem | null
  onCloseDeck: () => void
  onCloseNote: () => void
  onConfirmDeck: () => void
  onConfirmNote: () => void
}) => (
  <>
    <ConfirmDialog
      actionError={deckActionError}
      confirmLabel="Delete deck"
      confirming={deletingDeck}
      description={
        pendingDeck
          ? `This moves "${pendingDeck.title}" to Trash. You can restore it later.`
          : ''
      }
      open={pendingDeck !== null}
      title={pendingDeck ? `Delete "${pendingDeck.title}"?` : 'Delete deck?'}
      onConfirm={onConfirmDeck}
      onOpenChange={(open) => {
        if (!open) {
          onCloseDeck()
        }
      }}
    />
    <ConfirmDialog
      actionError={noteActionError}
      confirmLabel="Delete note"
      confirming={deletingNote}
      description={
        pendingNote
          ? `This moves "${pendingNote.title}" to Trash. You can restore it later.`
          : ''
      }
      open={pendingNote !== null}
      title={pendingNote ? `Delete "${pendingNote.title}"?` : 'Delete note?'}
      onConfirm={onConfirmNote}
      onOpenChange={(open) => {
        if (!open) {
          onCloseNote()
        }
      }}
    />
  </>
)
