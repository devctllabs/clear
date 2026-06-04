import type { ReviewService } from '@features/review/services/reviewService'
import { domainError, err, ok } from '@shared/errors'
import { mockAppDataStore } from '@platform/mock/mockAppDataStore'

export const mockReviewService: ReviewService = {
  async start(deckId) {
    const result = mockAppDataStore.startReview(deckId)

    return result ? ok(result) : err(domainError.notFound('Deck not found.'))
  },
  async get(reviewId) {
    const review = mockAppDataStore.getReviewById(reviewId)

    return review ? ok(review) : err(domainError.notFound('Review not found.'))
  },
  async grade(reviewId, cardId, grade) {
    const result = mockAppDataStore.grade(reviewId, cardId, grade)

    return result ? ok(result) : err(domainError.notFound('Review card not found.'))
  },
}
