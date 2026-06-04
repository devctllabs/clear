import { createFileRoute } from '@tanstack/react-router'

import { ReviewStartPage } from '@features/review'

const DashboardDeckReviewRoute = () => {
  const { deckId, workspaceId } = Route.useParams()

  return <ReviewStartPage deckId={deckId} workspaceId={workspaceId} />
}

export const Route = createFileRoute('/dashboard/$workspaceId/decks/$deckId/review/')({
  component: DashboardDeckReviewRoute,
})
