import type { ReviewService } from '@features/review/services/reviewService'
import { mockApi } from '@platform/mock/mockApi'
import {
  toMockDomainResult,
  toReviewSession,
  toReviewStartResult,
} from '@platform/mock/mockDomainResult'

export const mockReviewService: ReviewService = {
  async start(deckId) {
    return toMockDomainResult(
      () => mockApi.reviewService.startReviewSession(deckId),
      toReviewStartResult,
    )
  },
  async get(reviewId) {
    return toMockDomainResult(
      () => mockApi.reviewService.getReviewSession(reviewId),
      toReviewSession,
    )
  },
  async grade(reviewId, cardId, grade) {
    return toMockDomainResult(
      () => mockApi.reviewService.gradeReviewSessionCard(reviewId, cardId, grade),
      toReviewSession,
    )
  },
}
