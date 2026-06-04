import { CheckCircle2 } from 'lucide-react'
import { Link } from '@tanstack/react-router'

import { Button } from '@shared/components/ui/button'
import { cn } from '@shared/lib/utils'
import {
  formatNonNegativeInteger,
  normalizeNonNegativeInteger,
} from '@shared/lib/number-format'

import type { DueReviewSession } from '../types/review.types'
import {
  reviewSummaryActionBaseClassName,
  reviewSummaryActionStackClassName,
  reviewSummaryCardClassName,
  reviewSummaryHeaderClassName,
  reviewSummaryHeaderTextClassName,
  reviewSummaryMetricCellClassName,
  reviewSummaryMetricDividerClassName,
  reviewSummaryMetricsClassName,
  reviewSummaryStackClassName,
} from './ReviewSummaryLayout'

const secondsInMinute = 60
const minutesInHour = 60

const formatDurationSeconds = (value: number | undefined) => {
  const seconds = normalizeNonNegativeInteger(value ?? 0)

  if (seconds < secondsInMinute) {
    return `${formatNonNegativeInteger(seconds)}s`
  }

  if (seconds < secondsInMinute * minutesInHour) {
    return `${formatNonNegativeInteger(seconds / secondsInMinute)}m`
  }

  const totalMinutes = normalizeNonNegativeInteger(seconds / secondsInMinute)
  const hours = Math.floor(totalMinutes / minutesInHour)
  const minutes = totalMinutes % minutesInHour

  return `${formatNonNegativeInteger(hours)}h ${formatNonNegativeInteger(minutes)}m`
}

export const ReviewSummaryCard = ({
  backLabel = 'Back to deck',
  backTo,
  continueTo,
  summary,
}: {
  backLabel?: string
  backTo: string
  continueTo?: string
  summary?: DueReviewSession
}) => (
  <div className={reviewSummaryStackClassName}>
    <section className={reviewSummaryCardClassName}>
      <div className={reviewSummaryHeaderClassName}>
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-foreground sm:size-12">
          <CheckCircle2 className="size-5 stroke-[2.4]" />
        </span>
        <div className={reviewSummaryHeaderTextClassName}>
          <h1 className="text-wrap-anywhere type-study-title text-foreground">
            Review complete
          </h1>
          <p className="text-wrap-anywhere mt-2 text-sm leading-6 text-muted-foreground">
            Your progress was saved to this deck.
          </p>
        </div>
      </div>

      <div className={reviewSummaryMetricsClassName}>
        <span
          aria-hidden="true"
          className={reviewSummaryMetricDividerClassName}
        />
        <div className={reviewSummaryMetricCellClassName}>
          <span className="type-label uppercase text-muted-foreground">
            Cards reviewed
          </span>
          <span className="text-wrap-anywhere mt-2 block text-2xl font-bold leading-none text-foreground">
            {formatNonNegativeInteger(summary?.reviewedCount ?? 0)}
          </span>
        </div>
        <div className={reviewSummaryMetricCellClassName}>
          <span className="type-label uppercase text-muted-foreground">
            Duration
          </span>
          <span className="text-wrap-anywhere mt-2 block text-2xl font-bold leading-none text-foreground">
            {formatDurationSeconds(summary?.durationSeconds)}
          </span>
        </div>
      </div>
    </section>
    <div className={reviewSummaryActionStackClassName}>
      <Button
        asChild
        className={cn(
          'type-action bg-primary text-primary-foreground transition-transform active:scale-95',
          reviewSummaryActionBaseClassName,
        )}
        variant="default"
      >
        <Link to={(continueTo ?? backTo) as never}>
          {continueTo ? 'Continue review' : backLabel}
        </Link>
      </Button>
      {continueTo ? (
        <Button
          asChild
          className={cn(
            'type-action border border-border bg-card text-foreground transition-transform active:scale-95',
            reviewSummaryActionBaseClassName,
          )}
          variant="outline"
        >
          <Link to={backTo as never}>
            {backLabel}
          </Link>
        </Button>
      ) : null}
    </div>
  </div>
)
