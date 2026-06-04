import { createFileRoute } from '@tanstack/react-router'

import { NoteEditorPage } from '@features/notes'

const DashboardDeckNoteEditRoute = () => {
  const { deckId, noteId, workspaceId } = Route.useParams()

  return (
    <NoteEditorPage
      deckId={deckId}
      kind="basic"
      mode="edit"
      noteId={noteId}
      workspaceId={workspaceId}
    />
  )
}

export const Route = createFileRoute(
  '/dashboard/$workspaceId/decks/$deckId/notes/$noteId/edit',
)({
  component: DashboardDeckNoteEditRoute,
})
