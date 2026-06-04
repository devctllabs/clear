import { SkeletonBlock } from '@shared/components/feedback/SkeletonBlock'

import {
  reviewSummaryActionBaseClassName,
  reviewSummaryActionStackClassName,
  reviewSummaryCardClassName,
  reviewSummaryHeaderClassName,
  reviewSummaryHeaderTextClassName,
  reviewSummaryLaneClassName,
  reviewSummaryMainClassName,
  reviewSummaryMetricCellClassName,
  reviewSummaryMetricDividerClassName,
  reviewSummaryMetricsClassName,
  reviewSummaryStackClassName,
} from './ReviewSummaryLayout'

export const ReviewSessionLoadingState = () => (
  <main
    id="main-content"
    className="relative flex min-h-screen overflow-x-hidden flex-col bg-background text-foreground"
  >
    <section aria-label="Loading review" aria-live="polite" role="status">
      <div aria-hidden="true">
        <header className="fixed top-0 z-50 w-full bg-background/95 backdrop-blur-md">
          <div className="mx-auto grid h-16 max-w-xl grid-cols-[44px_1fr_44px] items-center px-6">
            <SkeletonBlock className="size-11 rounded-full" />
            <SkeletonBlock className="mx-auto h-5 w-36 rounded-[0.625rem] lg:h-6" />
            <div />
          </div>
        </header>

        <section className="@container mx-auto min-h-screen w-full max-w-xl px-6">
          <div className="flex min-h-screen w-full flex-col pb-44 pt-24 @min-[22rem]:pb-36 md:pb-16">
            <section className="mb-12 flex w-full min-w-0 flex-col items-center space-y-4">
              <div className="flex w-full min-w-0 flex-col items-center text-center">
                <SkeletonBlock className="mb-2 h-3 w-20" />
                <SkeletonBlock className="h-6 w-full max-w-[14rem] rounded-[0.75rem]" />
              </div>

              <div className="w-full max-w-48 space-y-2">
                <div className="flex items-end justify-between">
                  <SkeletonBlock className="h-3 w-12" />
                  <SkeletonBlock className="h-3 w-8" />
                </div>
                <SkeletonBlock className="h-1.5 w-full" />
              </div>
            </section>

            <article className="editorial-shadow relative w-full min-w-0 overflow-hidden rounded-card border border-border bg-card px-6 py-8 shadow-card sm:px-12 sm:py-10">
              <div className="absolute left-6 top-6 flex max-w-[calc(100%-3rem)] gap-2 sm:left-8 sm:top-8">
                <SkeletonBlock className="h-6 w-16 rounded-md" />
              </div>
              <div className="relative z-10 flex w-full min-w-0 flex-col space-y-10 pt-16 sm:pl-8">
                <section className="min-w-0 space-y-4">
                  <SkeletonBlock className="h-3 w-16" />
                  <div className="space-y-3">
                    <SkeletonBlock className="h-6 w-full" />
                    <SkeletonBlock className="h-6 w-11/12" />
                    <SkeletonBlock className="h-6 w-2/3" />
                  </div>
                </section>
              </div>
            </article>
            <div
              className="md:mt-10"
              data-slot="review-session-loading-action-area"
            >
              <footer className="fixed bottom-[var(--visual-viewport-bottom-offset,0px)] left-0 z-50 w-full bg-background/95 pb-[calc(2.5rem+env(safe-area-inset-bottom))] pt-4 backdrop-blur-md md:static md:z-auto md:bg-transparent md:p-0 md:backdrop-blur-0">
                <div className="mx-auto max-w-xl px-6 md:max-w-none md:px-0">
                  <SkeletonBlock className="h-14 w-full rounded-full" />
                </div>
              </footer>
            </div>
          </div>
        </section>
      </div>
    </section>
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
    />
  </main>
)

export const ReviewSummaryLoadingState = () => (
  <main
    id="main-content"
    className={reviewSummaryMainClassName}
  >
    <section aria-label="Loading summary" aria-live="polite" role="status">
      <div
        aria-hidden="true"
        className={reviewSummaryLaneClassName}
      >
        <div
          className={reviewSummaryStackClassName}
          data-slot="review-summary-loading-stack"
        >
          <section
            className={reviewSummaryCardClassName}
            data-slot="review-summary-loading-card"
          >
            <div className={reviewSummaryHeaderClassName}>
              <SkeletonBlock className="size-11 shrink-0 sm:size-12" />
              <div className={reviewSummaryHeaderTextClassName}>
                <SkeletonBlock className="h-8 w-full max-w-[14rem] rounded-[1rem]" />
                <SkeletonBlock className="mt-2 h-6 w-full max-w-[16rem]" />
              </div>
            </div>

            <div className={reviewSummaryMetricsClassName}>
              <span
                aria-hidden="true"
                className={reviewSummaryMetricDividerClassName}
              />
              <div className={reviewSummaryMetricCellClassName}>
                <SkeletonBlock className="mx-auto h-4 w-24" />
                <SkeletonBlock className="mx-auto mt-2 h-7 w-12 rounded-[0.875rem]" />
              </div>
              <div className={reviewSummaryMetricCellClassName}>
                <SkeletonBlock className="mx-auto h-4 w-16" />
                <SkeletonBlock className="mx-auto mt-2 h-7 w-14 rounded-[0.875rem]" />
              </div>
            </div>
          </section>
          <div
            className={reviewSummaryActionStackClassName}
            data-slot="review-summary-loading-actions"
          >
            <SkeletonBlock
              className={reviewSummaryActionBaseClassName}
              data-slot="review-summary-loading-action"
            />
            <SkeletonBlock
              className={reviewSummaryActionBaseClassName}
              data-slot="review-summary-loading-action"
            />
          </div>
        </div>
      </div>
    </section>
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
    />
  </main>
)
