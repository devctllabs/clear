import { mobileLaneClassName } from '@shared/components/layout/LayoutLane'
import { cn } from '@shared/lib/utils'

export const reviewSummaryMainClassName =
  'relative min-h-screen overflow-x-hidden bg-background text-foreground'

export const reviewSummaryLaneClassName = cn(
  mobileLaneClassName,
  'flex min-h-screen flex-col justify-center px-5 pb-12 pt-16 sm:px-6 sm:pb-16 sm:pt-20 lg:justify-start lg:pt-24',
)

export const reviewSummaryStackClassName = 'space-y-5'

export const reviewSummaryCardClassName =
  'rounded-panel border border-border bg-card p-5 shadow-card sm:rounded-card sm:p-7'

export const reviewSummaryHeaderClassName = 'flex items-start gap-4'

export const reviewSummaryHeaderTextClassName = 'min-w-0 flex-1'

export const reviewSummaryMetricsClassName =
  'relative mt-7 grid grid-cols-2 items-center px-1 py-1'

export const reviewSummaryMetricDividerClassName =
  'absolute bottom-2 left-1/2 top-2 w-px -translate-x-1/2 bg-border/50'

export const reviewSummaryMetricCellClassName = 'min-w-0 px-4 text-center'

export const reviewSummaryActionStackClassName = 'flex flex-col gap-3'

export const reviewSummaryActionBaseClassName = 'h-12 w-full rounded-full'
