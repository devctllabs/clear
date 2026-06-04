import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { unwrapDomainResult } from '@core/query/domain-query'
import { useServices } from '@core/services'

import type { ReviewGrade } from '../types/review.types'

export const reviewKeys = {
  session: (reviewId: string) => ['review', reviewId, 'session'] as const,
}

export const useStartReview = (deckId: string) => {
  const { review } = useServices()

  return useMutation({
    mutationFn: () => unwrapDomainResult(review.start(deckId)),
  })
}

export const useReviewSession = (reviewId: string) => {
  const { review } = useServices()

  return useQuery({
    enabled: reviewId.length > 0,
    queryKey: reviewKeys.session(reviewId),
    queryFn: () => unwrapDomainResult(review.get(reviewId)),
  })
}

export const useGradeReview = (reviewId: string) => {
  const queryClient = useQueryClient()
  const { review } = useServices()

  return useMutation({
    mutationFn: ({
      cardId,
      grade,
    }: {
      cardId: string
      grade: ReviewGrade
    }) => unwrapDomainResult(review.grade(reviewId, cardId, grade)),
    onSuccess: (result) => {
      queryClient.setQueryData(reviewKeys.session(result.id), result)
    },
  })
}
