import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useDeck } from '@features/decks/hooks/useDecks'
import { BottomActionErrorStatus } from '@shared/components/feedback/BottomActionErrorStatus'
import { LoadErrorState } from '@shared/components/feedback/LoadErrorState'
import { useDelayedBoolean } from '@shared/hooks/useDelayedBoolean'
import { consumeReviewReturnTarget } from '@shared/lib/navigation-state'

import { ReviewSessionLoadingState } from '../components/ReviewLoadingStates'
import { ReviewUnavailableState } from '../components/ReviewUnavailableState'
import {
  ReviewSessionActions,
  ReviewSessionContent,
  ReviewSessionHeader,
} from '../components/ReviewSessionView'
import { useGradeReview, useReviewSession } from '../hooks/useReview'
import type { ReviewGrade } from '../types/review.types'

export const ReviewSessionPage = ({
  deckId,
  reviewId,
  workspaceId,
}: {
  deckId: string
  reviewId: string
  workspaceId: string
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const deckQuery = useDeck(deckId)
  const reviewSession = useReviewSession(reviewId)
  const gradeReview = useGradeReview(reviewId)
  const [pendingGrade, setPendingGrade] = useState<ReviewGrade | null>(null)
  const [revealed, setRevealed] = useState(false)
  const session = reviewSession.data
  const card = session?.currentCard ?? null
  const fallbackCloseTo = `/dashboard/${workspaceId}/decks/${deckId}`

  useEffect(() => {
    setRevealed(false)
  }, [card?.id, session?.reviewedCount])

  useEffect(() => {
    if (session?.mode === 'due' && session.status === 'completed') {
      void navigate({
        params: { deckId, reviewId: session.id, workspaceId },
        replace: true,
        to: '/dashboard/$workspaceId/decks/$deckId/review/$reviewId/summary',
      })
    }
  }, [deckId, navigate, session, workspaceId])

  const isInitialLoading = deckQuery.isLoading || reviewSession.isLoading
  const showInitialLoading = useDelayedBoolean(isInitialLoading, 180)
  const showGradeSpinner = useDelayedBoolean(gradeReview.isPending, 250)
  const initialError =
    deckQuery.isError && !deckQuery.data
      ? deckQuery.error
      : reviewSession.isError && reviewSession.data === undefined
        ? reviewSession.error
        : null
  const closeReview = () => {
    const closeTo = consumeReviewReturnTarget(workspaceId, deckId) ?? fallbackCloseTo

    void navigate({
      to: closeTo as never,
    })
  }

  if (showInitialLoading) {
    return <ReviewSessionLoadingState />
  }

  if (isInitialLoading) {
    return (
      <main
        id="main-content"
        className="relative flex min-h-screen overflow-x-hidden flex-col bg-background text-foreground"
      />
    )
  }

  if (initialError) {
    return (
      <main
        id="main-content"
        className="relative flex min-h-screen overflow-x-hidden flex-col bg-background text-foreground"
      >
        <ReviewSessionHeader onClose={closeReview} />
        <section className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-6 pb-32 pt-24">
          <LoadErrorState
            error={initialError}
            title={t(($) => $.review.errors.reviewCouldNotLoad)}
            onRetry={() => {
              if (deckQuery.isError) {
                void deckQuery.refetch()
              }
              if (reviewSession.isError) {
                void reviewSession.refetch()
              }
            }}
          />
        </section>
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
        />
      </main>
    )
  }

  const deck = deckQuery.data

  if (session?.mode === 'due' && session.status === 'completed') {
    return (
      <main
        id="main-content"
        className="relative flex min-h-screen overflow-x-hidden flex-col bg-background text-foreground"
      />
    )
  }

  if (!deck || !session || !card) {
    return (
      <ReviewUnavailableState
        deckId={deckId}
        workspaceId={workspaceId}
        onClose={closeReview}
      />
    )
  }

  const grade = (value: ReviewGrade) => {
    if (gradeReview.isPending) {
      return
    }

    setPendingGrade(value)
    gradeReview.mutate(
      { cardId: card.id, grade: value },
      {
        onSuccess: (result) => {
          if (result.mode === 'due' && result.status === 'completed') {
            void navigate({
              params: { deckId, reviewId: result.id, workspaceId },
              to: '/dashboard/$workspaceId/decks/$deckId/review/$reviewId/summary',
            })
          }
        },
        onSettled: () => {
          setPendingGrade(null)
        },
      },
    )
  }

  return (
    <main
      id="main-content"
      className="relative flex min-h-screen overflow-x-hidden flex-col bg-background text-foreground"
    >
      <ReviewSessionHeader
        onClose={closeReview}
      />
      <ReviewSessionContent
        actions={
          <>
            <BottomActionErrorStatus
              className="bottom-44 z-[60] min-[22rem]:bottom-32 md:static md:z-auto md:px-0"
              contentClassName="max-w-xl md:max-w-none"
              error={gradeReview.isError ? gradeReview.error : null}
              title={t(($) => $.review.errors.couldNotGradeCard)}
            />
            <ReviewSessionActions
              disabled={gradeReview.isPending}
              pendingGrade={showGradeSpinner ? pendingGrade : null}
              revealed={revealed}
              onGrade={grade}
              onReveal={() => setRevealed(true)}
            />
          </>
        }
        deckTitle={deck.title}
        card={card}
        plannedCount={session.mode === 'due' ? session.plannedCount : undefined}
        progressMode={session.mode === 'due' ? 'bounded' : 'reviewed-only'}
        revealed={revealed}
        reviewedCount={session.reviewedCount}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
      />
    </main>
  )
}
