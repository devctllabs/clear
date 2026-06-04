import { createFileRoute } from '@tanstack/react-router'

import { ReviewSummaryPage } from '@features/review'

const DashboardDeckReviewSummaryRoute = () => {
  const { deckId, reviewId, workspaceId } = Route.useParams()

  return (
    <ReviewSummaryPage
      deckId={deckId}
      reviewId={reviewId}
      workspaceId={workspaceId}
    />
  )
}

export const Route = createFileRoute(
  '/dashboard/$workspaceId/decks/$deckId/review/$reviewId/summary',
)({
  component: DashboardDeckReviewSummaryRoute,
})
