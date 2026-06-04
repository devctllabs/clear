import { createFileRoute } from '@tanstack/react-router'

import { NoteDetailPage } from '@features/notes'

const DashboardDeckNoteRoute = () => {
  const { deckId, noteId, workspaceId } = Route.useParams()

  return <NoteDetailPage deckId={deckId} noteId={noteId} workspaceId={workspaceId} />
}

export const Route = createFileRoute('/dashboard/$workspaceId/decks/$deckId/notes/$noteId/')({
  component: DashboardDeckNoteRoute,
})
