import { createFileRoute } from '@tanstack/react-router'

import { DeckDetailPage } from '@features/decks'

const DashboardDeckRoute = () => {
  const { deckId, workspaceId } = Route.useParams()

  return <DeckDetailPage deckId={deckId} workspaceId={workspaceId} />
}

export const Route = createFileRoute('/dashboard/$workspaceId/decks/$deckId/')({
  component: DashboardDeckRoute,
})
