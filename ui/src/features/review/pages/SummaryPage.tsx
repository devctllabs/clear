import { useState } from 'react'

import { useDelayedBoolean } from '@shared/hooks/useDelayedBoolean'
import { LoadErrorState } from '@shared/components/feedback/LoadErrorState'
import { consumeReviewReturnTarget } from '@shared/lib/navigation-state'
import { domainError } from '@shared/errors'

import { ReviewSummaryLoadingState } from '../components/ReviewLoadingStates'
import { ReviewSummaryCard } from '../components/ReviewSummaryCard'
import {
  reviewSummaryLaneClassName,
  reviewSummaryMainClassName,
} from '../components/ReviewSummaryLayout'
import { useReviewSession } from '../hooks/useReview'

export const ReviewSummaryPage = ({
  deckId,
  reviewId,
  workspaceId,
}: {
  deckId: string
  reviewId: string
  workspaceId: string
}) => {
  const reviewQuery = useReviewSession(reviewId)
  const showInitialLoading = useDelayedBoolean(reviewQuery.isLoading, 180)
  const fallbackBackTo = `/dashboard/${workspaceId}/decks/${deckId}`
  const [returnTarget] = useState(() => consumeReviewReturnTarget(workspaceId, deckId))
  const backTo = returnTarget ?? fallbackBackTo
  const backLabel = returnTarget ? 'Back' : 'Back to deck'
  const continueTo = `/dashboard/${workspaceId}/decks/${deckId}/review`

  if (showInitialLoading) {
    return <ReviewSummaryLoadingState />
  }

  if (reviewQuery.isLoading) {
    return <main id="main-content" className={reviewSummaryMainClassName} />
  }

  const review = reviewQuery.data
  const summary =
    review?.mode === 'due' && review.status === 'completed' ? review : undefined

  if (reviewQuery.isError && summary === undefined) {
    return (
      <main id="main-content" className={reviewSummaryMainClassName}>
        <div className={reviewSummaryLaneClassName}>
          <LoadErrorState
            backLabel={backLabel}
            backTo={backTo}
            error={reviewQuery.error}
            title="Review summary could not be loaded"
            onRetry={() => {
              void reviewQuery.refetch()
            }}
          />
        </div>
      </main>
    )
  }

  if (!summary) {
    return (
      <main id="main-content" className={reviewSummaryMainClassName}>
        <div className={reviewSummaryLaneClassName}>
          <LoadErrorState
            backLabel={backLabel}
            backTo={backTo}
            error={domainError.conflict('This review is not complete yet.')}
            title="Review summary is not available"
          />
        </div>
      </main>
    )
  }

  return (
    <main id="main-content" className={reviewSummaryMainClassName}>
      <div className={reviewSummaryLaneClassName}>
        <ReviewSummaryCard
          backLabel={backLabel}
          backTo={backTo}
          continueTo={continueTo}
          summary={summary}
        />
      </div>
    </main>
  )
}
