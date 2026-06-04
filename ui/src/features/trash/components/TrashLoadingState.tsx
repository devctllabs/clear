import { SkeletonBlock } from '@shared/components/feedback/SkeletonBlock'
import { Card } from '@shared/components/ui/card'

const TrashRowSkeleton = () => (
  <div className="flex w-full min-w-0 items-start gap-4 px-6 py-5">
    <SkeletonBlock className="mt-1 size-11 shrink-0" />

    <div className="min-w-0 flex-1">
      <SkeletonBlock className="h-5 w-full max-w-[13rem]" />
      <SkeletonBlock className="mt-2 h-5 w-16" />
      <div className="mt-2 space-y-2">
        <SkeletonBlock className="h-3.5 w-full" />
        <SkeletonBlock className="h-3.5 w-2/3" />
      </div>
    </div>

    <SkeletonBlock className="mt-1 size-10 shrink-0" />
  </div>
)

export const TrashLoadingState = () => (
  <section
    aria-label="Loading trash"
    aria-live="polite"
    className="w-full min-w-0"
    role="status"
  >
    <div aria-hidden="true" className="space-y-6">
      <div className="flex items-center justify-between gap-x-4 gap-y-2 rounded-full bg-muted px-6 py-5 ring-1 ring-border/60">
        <div className="flex min-w-0 shrink-0 items-center gap-4">
          <SkeletonBlock className="size-3 shrink-0" />
          <SkeletonBlock className="h-5 w-20" />
        </div>
        <div className="min-w-0 flex-1">
          <SkeletonBlock className="ml-auto h-4 w-32 max-w-full" />
        </div>
      </div>

      <Card className="overflow-hidden rounded-card border border-border bg-card py-0 shadow-card">
        <TrashRowSkeleton />
        <div className="mx-6 border-t border-border/60" />
        <TrashRowSkeleton />
        <div className="mx-6 border-t border-border/60" />
        <TrashRowSkeleton />
      </Card>
    </div>
  </section>
)
