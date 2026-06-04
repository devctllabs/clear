import { CheckCircle2 } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { Button } from '@shared/components/ui/button'
import { cn } from '@shared/lib/utils'
import { formatNonNegativeInteger } from '@shared/lib/number-format'
import { formatDurationSeconds } from '@shared/lib/translated-date-format'

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

export const ReviewSummaryCard = ({
  backLabel,
  backTo,
  continueTo,
  summary,
}: {
  backLabel?: string
  backTo: string
  continueTo?: string
  summary?: DueReviewSession
}) => {
  const { t } = useTranslation()
  const resolvedBackLabel = backLabel ?? t(($) => $.review.actions.backToDeck)

  return (
    <div className={reviewSummaryStackClassName}>
      <section className={reviewSummaryCardClassName}>
        <div className={reviewSummaryHeaderClassName}>
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-foreground sm:size-12">
            <CheckCircle2 className="size-5 stroke-[2.4]" />
          </span>
          <div className={reviewSummaryHeaderTextClassName}>
            <h1 className="text-wrap-anywhere type-study-title text-foreground">
              {t(($) => $.review.labels.reviewComplete)}
            </h1>
            <p className="text-wrap-anywhere mt-2 text-sm leading-6 text-muted-foreground">
              {t(($) => $.review.summary.saved)}
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
              {t(($) => $.review.labels.cardsReviewed)}
            </span>
            <span className="text-wrap-anywhere mt-2 block text-2xl font-bold leading-none text-foreground">
              {formatNonNegativeInteger(summary?.reviewedCount ?? 0)}
            </span>
          </div>
          <div className={reviewSummaryMetricCellClassName}>
            <span className="type-label uppercase text-muted-foreground">
              {t(($) => $.review.labels.duration)}
            </span>
            <span className="text-wrap-anywhere mt-2 block text-2xl font-bold leading-none text-foreground">
              {formatDurationSeconds(t, summary?.durationSeconds)}
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
            {continueTo ? t(($) => $.review.actions.continueReview) : resolvedBackLabel}
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
              {resolvedBackLabel}
            </Link>
          </Button>
        ) : null}
      </div>
    </div>
  )
}
