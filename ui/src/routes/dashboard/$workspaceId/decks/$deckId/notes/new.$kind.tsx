import { createFileRoute } from '@tanstack/react-router'

import { NoteEditorPage, type NoteKind } from '@features/notes'

const DashboardDeckNoteNewRoute = () => {
  const { deckId, kind, workspaceId } = Route.useParams()
  const noteKind: NoteKind = kind === 'cloze' ? 'cloze' : 'basic'

  return (
    <NoteEditorPage
      deckId={deckId}
      kind={noteKind}
      mode="create"
      workspaceId={workspaceId}
    />
  )
}

export const Route = createFileRoute(
  '/dashboard/$workspaceId/decks/$deckId/notes/new/$kind',
)({
  component: DashboardDeckNoteNewRoute,
})
