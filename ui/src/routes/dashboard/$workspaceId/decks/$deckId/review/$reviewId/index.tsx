import { createFileRoute } from '@tanstack/react-router'

import { ReviewSessionPage } from '@features/review'

const DashboardDeckReviewSessionRoute = () => {
  const { deckId, reviewId, workspaceId } = Route.useParams()

  return (
    <ReviewSessionPage
      deckId={deckId}
      reviewId={reviewId}
      workspaceId={workspaceId}
    />
  )
}

export const Route = createFileRoute('/dashboard/$workspaceId/decks/$deckId/review/$reviewId/')({
  component: DashboardDeckReviewSessionRoute,
})
