import type { NoteListItem } from '@features/notes'
import { ConfirmDialog } from '@shared/components/feedback/ConfirmDialog'
import { useTranslation } from 'react-i18next'

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
  <DeckDeleteDialogsContent
    deckActionError={deckActionError}
    deletingDeck={deletingDeck}
    deletingNote={deletingNote}
    noteActionError={noteActionError}
    pendingDeck={pendingDeck}
    pendingNote={pendingNote}
    onCloseDeck={onCloseDeck}
    onCloseNote={onCloseNote}
    onConfirmDeck={onConfirmDeck}
    onConfirmNote={onConfirmNote}
  />
)

const DeckDeleteDialogsContent = ({
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
}: Parameters<typeof DeckDeleteDialogs>[0]) => {
  const { t } = useTranslation()

  return (
    <>
      <ConfirmDialog
        actionError={deckActionError}
        confirmLabel={t(($) => $.decks.actions.deleteDeck)}
        confirming={deletingDeck}
        description={
          pendingDeck
            ? t(($) => $.decks.dialogs.deleteDeckDescription, { title: pendingDeck.title })
            : ''
        }
        open={pendingDeck !== null}
        title={
          pendingDeck
            ? t(($) => $.decks.dialogs.deleteDeckTitle, { title: pendingDeck.title })
            : t(($) => $.decks.dialogs.deleteDeckFallbackTitle)
        }
        onConfirm={onConfirmDeck}
        onOpenChange={(open) => {
          if (!open) {
            onCloseDeck()
          }
        }}
      />
      <ConfirmDialog
        actionError={noteActionError}
        confirmLabel={t(($) => $.notes.actions.deleteNote)}
        confirming={deletingNote}
        description={
          pendingNote
            ? t(($) => $.notes.dialogs.deleteNoteDescription, { title: pendingNote.title })
            : ''
        }
        open={pendingNote !== null}
        title={
          pendingNote
            ? t(($) => $.notes.dialogs.deleteNoteTitle, { title: pendingNote.title })
            : t(($) => $.notes.dialogs.deleteNoteFallbackTitle)
        }
        onConfirm={onConfirmNote}
        onOpenChange={(open) => {
          if (!open) {
            onCloseNote()
          }
        }}
      />
    </>
  )
}
