import type { DomainResult } from '@shared/errors'

import type {
  ReviewGrade,
  ReviewSession,
  ReviewStartResult,
} from '../types/review.types'

export interface ReviewService {
  start(deckId: string): DomainResult<ReviewStartResult>
  get(reviewId: string): DomainResult<ReviewSession>
  grade(
    reviewId: string,
    cardId: string,
    grade: ReviewGrade,
  ): DomainResult<ReviewSession>
}
