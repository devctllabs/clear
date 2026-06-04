import {
  getReviewSession as apiGetReviewSession,
  gradeReviewSessionCard as apiGradeReviewSessionCard,
  startReviewSession as apiStartReviewSession,
} from '@api-generated/clear-api'
import type {
  ReviewCard as ApiReviewCard,
  ReviewSession as ApiReviewSession,
  ReviewStartResult as ApiReviewStartResult,
} from '@api-generated/clear-api'

import type { ReviewService } from '@features/review/services/reviewService'
import type {
  DueReviewSession,
  PracticeReviewSession,
  ReviewCard,
  ReviewSession,
  ReviewStartResult,
} from '@features/review/types/review.types'
import { toDomainResult } from '@shared/services/api/sdk-result'

export const webReviewService: ReviewService = {
  start(deckId) {
    return toDomainResult(
      apiStartReviewSession({ path: { deckId } }),
      toReviewStartResult,
      'Failed to start review.',
    )
  },
  get(reviewId) {
    return toDomainResult(
      apiGetReviewSession({ path: { reviewId } }),
      toReviewSession,
      'Failed to load review.',
    )
  },
  grade(reviewId, cardId, grade) {
    return toDomainResult(
      apiGradeReviewSessionCard({
        body: { grade },
        path: { cardId, reviewId },
      }),
      toReviewSession,
      'Failed to grade review card.',
    )
  },
}

const toReviewStartResult = (result: ApiReviewStartResult): ReviewStartResult =>
  result.mode === 'unavailable' ? result : toReviewSession(result)

const toReviewSession = (session: ApiReviewSession): ReviewSession =>
  session.mode === 'due' ? toDueReviewSession(session) : toPracticeReviewSession(session)

const toDueReviewSession = (
  session: Extract<ApiReviewSession, { mode: 'due' }>,
): DueReviewSession => ({
  ...(session.completedAt ? { completedAt: session.completedAt } : {}),
  ...(session.currentCard ? { currentCard: toReviewCard(session.currentCard) } : {}),
  deckId: session.deckId,
  durationSeconds: session.durationSeconds,
  id: session.id,
  mode: 'due',
  plannedCount: session.plannedCount,
  reviewedCount: session.reviewedCount,
  startedAt: session.startedAt,
  status: session.status,
})

const toPracticeReviewSession = (
  session: Extract<ApiReviewSession, { mode: 'practice' }>,
): PracticeReviewSession => ({
  currentCard: toReviewCard(session.currentCard),
  deckId: session.deckId,
  durationSeconds: session.durationSeconds,
  id: session.id,
  mode: 'practice',
  reviewedCount: session.reviewedCount,
  startedAt: session.startedAt,
})

const toReviewCard = (card: ApiReviewCard): ReviewCard => card
