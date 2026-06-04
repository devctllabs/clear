import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { LoadErrorState } from '@shared/components/feedback/LoadErrorState'
import { useDelayedBoolean } from '@shared/hooks/useDelayedBoolean'
import { consumeReviewReturnTarget } from '@shared/lib/navigation-state'

import { ReviewSessionLoadingState } from '../components/ReviewLoadingStates'
import { ReviewUnavailableState } from '../components/ReviewUnavailableState'
import { ReviewSessionHeader } from '../components/ReviewSessionView'
import { useStartReview } from '../hooks/useReview'

export const ReviewStartPage = ({
  deckId,
  workspaceId,
}: {
  deckId: string
  workspaceId: string
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const startReview = useStartReview(deckId)
  const showInitialLoading = useDelayedBoolean(startReview.isPending, 180)
  const fallbackCloseTo = `/dashboard/${workspaceId}/decks/${deckId}`
  const closeReview = () => {
    const closeTo = consumeReviewReturnTarget(workspaceId, deckId) ?? fallbackCloseTo

    void navigate({
      to: closeTo as never,
    })
  }

  useEffect(() => {
    if (startReview.status !== 'idle') {
      return
    }

    startReview.mutate(undefined, {
      onSuccess: (result) => {
        if (result.mode === 'unavailable') {
          return
        }

        void navigate({
          params: { deckId, reviewId: result.id, workspaceId },
          replace: true,
          to: '/dashboard/$workspaceId/decks/$deckId/review/$reviewId',
        })
      },
    })
  }, [deckId, navigate, startReview, workspaceId])

  if (showInitialLoading) {
    return <ReviewSessionLoadingState />
  }

  if (startReview.isPending || startReview.status === 'idle') {
    return (
      <main
        id="main-content"
        className="relative flex min-h-screen overflow-x-hidden flex-col bg-background text-foreground"
      />
    )
  }

  if (startReview.isError) {
    return (
      <main
        id="main-content"
        className="relative flex min-h-screen overflow-x-hidden flex-col bg-background text-foreground"
      >
        <ReviewSessionHeader onClose={closeReview} />
        <section className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-6 pb-32 pt-24">
          <LoadErrorState
            error={startReview.error}
            title={t(($) => $.review.errors.reviewCouldNotStart)}
            onRetry={() => {
              startReview.reset()
            }}
          />
        </section>
      </main>
    )
  }

  return (
    <ReviewUnavailableState
      deckId={deckId}
      workspaceId={workspaceId}
      onClose={closeReview}
    />
  )
}
