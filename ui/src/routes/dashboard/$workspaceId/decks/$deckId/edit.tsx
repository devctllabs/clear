import { createFileRoute } from '@tanstack/react-router'

import { DeckEditPage } from '@features/decks'

const DashboardDeckEditRoute = () => {
  const { deckId, workspaceId } = Route.useParams()

  return <DeckEditPage deckId={deckId} workspaceId={workspaceId} />
}

export const Route = createFileRoute('/dashboard/$workspaceId/decks/$deckId/edit')({
  component: DashboardDeckEditRoute,
})
