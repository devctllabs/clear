import { act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderHookWithProviders } from '@/test/renderHook'

import {
  useGradeReview,
  useReviewSession,
  useStartReview,
} from './useReview'

describe('review hooks', () => {
  it('reads review data and grades cards', async () => {
    const { result } = renderHookWithProviders(() => {
      const start = useStartReview('world-history')
      const reviewId = start.data?.mode === 'due' || start.data?.mode === 'practice'
        ? start.data.id
        : ''
      const grade = useGradeReview(reviewId)

      return {
        grade,
        session: useReviewSession(reviewId),
        start,
      }
    })

    await act(async () => {
      await result.current.start.mutateAsync()
    })
    await waitFor(() => {
      expect(result.current.session.data?.mode).toBe('due')
      expect(result.current.session.data?.currentCard).toBeDefined()
    })

    const currentCard = result.current.session.data?.currentCard

    if (!currentCard) {
      throw new Error('Expected a current review card.')
    }

    await act(async () => {
      await result.current.grade.mutateAsync({
        cardId: currentCard.id,
        grade: 'good',
      })
    })
    await waitFor(() => expect(result.current.grade.data?.mode).toBe('due'))
    expect(result.current.grade.data?.reviewedCount).toBe(1)
    expect(result.current.grade.data?.currentCard).toBeUndefined()
    expect(result.current.grade.data?.mode === 'due' ? result.current.grade.data.status : undefined).toBe('completed')
    await waitFor(() => expect(result.current.session.data?.reviewedCount).toBe(1))
  })
})
