import type { ReactNode } from 'react'
import { Check, X } from 'lucide-react'

import { MarkdownContent } from '@shared/components/data/MarkdownContent'
import { PendingSpinner } from '@shared/components/feedback/PendingSpinner'
import { Button } from '@shared/components/ui/button'
import { IconButton } from '@shared/components/ui/icon-button'
import { useVisualViewportBottomOffset } from '@shared/hooks/useVisualViewportBottomOffset'
import {
  formatNonNegativeInteger,
  formatPercentage,
  normalizeNonNegativeInteger,
  normalizePercentage,
} from '@shared/lib/number-format'

import type { ReviewCard, ReviewGrade } from '../types/review.types'

export const ReviewSessionView = ({
  card,
  deckTitle,
  disabled = false,
  onClose,
  onGrade,
  onReveal,
  pendingGrade = null,
  plannedCount = 0,
  progressMode = 'bounded',
  revealed,
  reviewedCount = 0,
}: {
  card: ReviewCard
  deckTitle: string
  disabled?: boolean
  onClose: () => void
  onGrade: (grade: ReviewGrade) => void
  onReveal: () => void
  pendingGrade?: ReviewGrade | null
  plannedCount?: number
  progressMode?: 'bounded' | 'reviewed-only'
  revealed: boolean
  reviewedCount?: number
}) => (
  <main
    id="main-content"
    className="relative flex min-h-screen overflow-x-hidden flex-col bg-background text-foreground"
  >
    <ReviewSessionHeader onClose={onClose} />
    <ReviewSessionContent
      actions={
        <ReviewSessionActions
          disabled={disabled}
          pendingGrade={pendingGrade}
          revealed={revealed}
          onGrade={onGrade}
          onReveal={onReveal}
        />
      }
      card={card}
      deckTitle={deckTitle}
      plannedCount={plannedCount}
      progressMode={progressMode}
      revealed={revealed}
      reviewedCount={reviewedCount}
    />
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
    />
  </main>
)

export const ReviewSessionHeader = ({ onClose }: { onClose: () => void }) => {
  return (
    <header className="fixed top-0 z-50 w-full bg-background/95 backdrop-blur-md">
      <div className="mx-auto grid h-16 max-w-xl grid-cols-[44px_1fr_44px] items-center px-6">
        <IconButton
          className="text-foreground/70"
          icon={<X className="size-5" />}
          label="Close"
          size="lg"
          type="button"
          onClick={onClose}
        />
        <h1 className="type-row-title whitespace-nowrap text-center text-foreground">
          Review
        </h1>
        <div />
      </div>
    </header>
  )
}

export const ReviewSessionContent = ({
  actions,
  card,
  deckTitle,
  plannedCount = 0,
  progressMode = 'bounded',
  revealed,
  reviewedCount = 0,
}: {
  actions?: ReactNode
  card: ReviewCard
  deckTitle: string
  plannedCount?: number
  progressMode?: 'bounded' | 'reviewed-only'
  revealed: boolean
  reviewedCount?: number
}) => {
  const normalizedPlannedCount = normalizeNonNegativeInteger(plannedCount)
  const normalizedRawReviewedCount = normalizeNonNegativeInteger(reviewedCount)
  const normalizedReviewedCount =
    progressMode === 'bounded'
      ? Math.min(normalizedRawReviewedCount, normalizedPlannedCount)
      : normalizedRawReviewedCount
  const progressPercent =
    progressMode === 'bounded' && normalizedPlannedCount > 0
      ? normalizePercentage((normalizedReviewedCount / normalizedPlannedCount) * 100)
      : 0

  return (
    <section className="@container mx-auto min-h-screen w-full max-w-xl px-6">
      <div
        className="flex min-h-screen w-full flex-col pb-44 pt-24 @min-[22rem]:pb-36 md:pb-16"
      >
        <section className="mb-12 flex w-full min-w-0 flex-col items-center space-y-4">
          <div className="flex min-w-0 flex-col items-center text-center">
            <span className="type-label mb-1 uppercase text-muted-foreground">
              Deck
            </span>
            <h2 className="text-wrap-anywhere type-study-title max-w-full text-primary">
              {deckTitle}
            </h2>
          </div>

          <div className="w-full max-w-48 space-y-2">
            {progressMode === 'bounded' ? (
              <>
                <div className="flex items-end justify-between">
                  <span className="type-label uppercase text-muted-foreground">
                    {formatNonNegativeInteger(normalizedReviewedCount)} /{' '}
                    {formatNonNegativeInteger(normalizedPlannedCount)}
                  </span>
                  <span className="type-label uppercase text-muted-foreground">
                    {formatPercentage(progressPercent)}
                  </span>
                </div>
                <div
                  aria-label="Review progress"
                  className="h-1.5 w-full overflow-hidden rounded-full bg-border/50"
                  role="progressbar"
                >
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </>
            ) : (
              <div
                aria-live="polite"
                className="flex items-center justify-center gap-3 text-center"
              >
                <Check
                  aria-hidden="true"
                  className="size-3.5 shrink-0 translate-y-px stroke-[2.5] text-foreground/45 [[data-theme=dark]_&]:text-muted-foreground/60"
                />
                <span className="sr-only">
                  Reviewed {formatNonNegativeInteger(normalizedReviewedCount)}
                </span>
                <span
                  aria-hidden="true"
                  className="font-mono text-[1.25rem] font-bold leading-none tabular-nums text-foreground/75 [[data-theme=dark]_&]:text-muted-foreground"
                >
                  {formatNonNegativeInteger(normalizedReviewedCount)}
                </span>
              </div>
            )}
          </div>
        </section>

        <ReviewSessionCard card={card} revealed={revealed} />
        {actions ? (
          <div className="md:mt-10 md:space-y-3" data-slot="review-session-action-area">
            {actions}
          </div>
        ) : null}
      </div>
    </section>
  )
}

export const ReviewSessionActions = ({
  disabled = false,
  onGrade,
  onReveal,
  pendingGrade = null,
  revealed,
}: {
  disabled?: boolean
  onGrade: (grade: ReviewGrade) => void
  onReveal: () => void
  pendingGrade?: ReviewGrade | null
  revealed: boolean
}) => {
  useVisualViewportBottomOffset()

  return (
    <footer className="fixed bottom-[var(--visual-viewport-bottom-offset,0px)] left-0 z-50 w-full bg-background/95 pb-[calc(2.5rem+env(safe-area-inset-bottom))] pt-4 backdrop-blur-md md:static md:z-auto md:bg-transparent md:p-0 md:backdrop-blur-0">
      <div className="@container mx-auto max-w-xl px-6 md:max-w-none md:px-0">
        {!revealed ? (
          <Button
            className="type-action h-auto min-h-14 w-full rounded-full bg-primary py-4 text-primary-foreground transition-[opacity,transform] hover:opacity-90 active:scale-[0.98]"
            disabled={disabled}
            type="button"
            variant="default"
            onClick={onReveal}
          >
            Show answer
          </Button>
        ) : (
          <div className="grid w-full grid-cols-2 gap-2 @min-[22rem]:grid-cols-4">
            <GradeButton
              disabled={disabled}
              label="Again"
              pending={pendingGrade === 'again'}
              onClick={() => onGrade('again')}
            />
            <GradeButton
              disabled={disabled}
              label="Hard"
              pending={pendingGrade === 'hard'}
              onClick={() => onGrade('hard')}
            />
            <GradeButton
              disabled={disabled}
              label="Good"
              pending={pendingGrade === 'good'}
              onClick={() => onGrade('good')}
            />
            <GradeButton
              disabled={disabled}
              label="Easy"
              pending={pendingGrade === 'easy'}
              onClick={() => onGrade('easy')}
            />
          </div>
        )}
      </div>
    </footer>
  )
}

const ReviewSessionCard = ({ card, revealed }: { card: ReviewCard; revealed: boolean }) => (
  <article className="editorial-shadow group relative w-full min-w-0 overflow-hidden rounded-card border border-border bg-card px-6 py-8 shadow-card sm:px-12 sm:py-10">
    <div className="absolute left-6 top-6 flex max-w-[calc(100%-3rem)] gap-2 sm:left-8 sm:top-8">
      <span className="type-label shrink-0 rounded-full bg-muted px-3 py-1 uppercase text-muted-foreground">
        {card.kind.toUpperCase()}
      </span>
    </div>
    <div className="relative z-10 flex w-full min-w-0 flex-col space-y-10 pt-16 sm:pl-8">
      {card.kind === 'basic' ? (
        <BasicReviewCardContent card={card} revealed={revealed} />
      ) : (
        <ClozeReviewCardContent card={card} revealed={revealed} />
      )}
      {revealed ? <RecallGauge value={card.progress} /> : null}
    </div>
  </article>
)

const BasicReviewCardContent = ({
  card,
  revealed,
}: {
  card: Extract<ReviewCard, { kind: 'basic' }>
  revealed: boolean
}) => (
  <>
    <section className="min-w-0 space-y-4">
      <span className="type-label block uppercase text-muted-foreground">
        Front
      </span>
      <MarkdownContent className="text-xl" markdown={card.front} />
    </section>
    {revealed ? (
      <>
        <div className="h-px w-full bg-muted" />
        <section className="min-w-0 space-y-4">
          <span className="type-label block uppercase text-muted-foreground">
            Back
          </span>
          <MarkdownContent className="text-xl" markdown={card.back} />
        </section>
      </>
    ) : null}
  </>
)

const ClozeReviewCardContent = ({
  card,
  revealed,
}: {
  card: Extract<ReviewCard, { kind: 'cloze' }>
  revealed: boolean
}) => (
  <section className="min-w-0 space-y-4">
    <MarkdownContent
      activeClozeId={card.clozeId}
      className="text-xl"
      clozeMode="review"
      markdown={card.body}
      revealed={revealed}
    />
  </section>
)

const GradeButton = ({
  disabled = false,
  label,
  onClick,
  pending = false,
}: {
  disabled?: boolean
  label: string
  onClick: () => void
  pending?: boolean
}) => (
  <Button
    aria-busy={pending || undefined}
    className="type-action min-h-14 w-full min-w-0 rounded-full border border-border bg-card px-3 py-4 uppercase text-foreground shadow-none transition-[background-color,color,transform] active:scale-[0.98]"
    disabled={disabled}
    type="button"
    variant="outline"
    onClick={onClick}
  >
    {pending ? <PendingSpinner decorative className="size-3.5" /> : null}
    {label}
  </Button>
)

const RecallGauge = ({ value }: { value: number }) => {
  const circumference = 113
  const normalized = normalizePercentage(value)
  const strokeDashoffset = circumference - (normalized / 100) * circumference

  return (
    <div className="flex w-full justify-end pt-1 sm:pr-8">
      <div className="relative">
        <svg className="h-10 w-10 -rotate-90 transform">
          <circle
            className="text-muted"
            cx="20"
            cy="20"
            fill="transparent"
            r="18"
            stroke="currentColor"
            strokeWidth="3"
          />
          <circle
            className="text-foreground"
            cx="20"
            cy="20"
            fill="transparent"
            r="18"
            stroke="currentColor"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            strokeWidth="3"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="type-label">{formatPercentage(value)}</span>
        </div>
      </div>
    </div>
  )
}
