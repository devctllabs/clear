import { useTranslation } from 'react-i18next'

import { SkeletonBlock } from '@shared/components/feedback/SkeletonBlock'
import { DesktopPageHeaderSkeleton } from '@shared/components/layout/DesktopShell'
import {
  mobileBottomNavContentPaddingClassName,
  mobileLaneClassName,
} from '@shared/components/layout/LayoutLane'
import { Card } from '@shared/components/ui/card'
import { cn } from '@shared/lib/utils'

const workspaceListDesktopGridClassName = 'grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3'

const WorkspaceCardSkeleton = ({
  density = 'regular',
}: {
  density?: 'compact' | 'regular'
}) => {
  if (density === 'compact') {
    return (
      <Card className="relative isolate overflow-hidden rounded-compact border border-border bg-card shadow-card">
        <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-4">
          <SkeletonBlock className="size-10 shrink-0" />
          <div className="min-w-0">
            <div className="space-y-1.5">
              <SkeletonBlock className="h-5 w-full max-w-[11rem] rounded-[0.75rem]" />
              <SkeletonBlock className="h-5 w-2/3 max-w-[7rem] rounded-[0.75rem]" />
            </div>
            <div className="mt-2 space-y-1">
              <SkeletonBlock className="h-4 w-full max-w-[14rem]" />
              <SkeletonBlock className="h-4 w-5/6 max-w-[11rem]" />
            </div>
            <div className="mt-2 flex min-w-0 items-center gap-2">
              <SkeletonBlock className="h-3 w-28" />
              <SkeletonBlock className="h-5 w-14 shrink-0 rounded-full" />
            </div>
          </div>
          <SkeletonBlock className="size-10 shrink-0" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="relative isolate flex h-full flex-col overflow-hidden rounded-panel border border-border bg-card shadow-card sm:rounded-card">
      <div className="flex h-full flex-1 flex-col p-5 sm:p-7">
        <div className="mb-6 flex items-start justify-between gap-4 sm:mb-10">
          <span aria-hidden="true" />
          <SkeletonBlock className="size-10 shrink-0" />
        </div>

        <div className="flex items-start gap-3.5 sm:gap-5">
          <SkeletonBlock className="size-11 shrink-0 sm:size-14" />
          <div className="min-w-0 flex-1 space-y-2">
            <SkeletonBlock className="h-7 w-full max-w-[10rem] rounded-[1rem] sm:h-9 sm:max-w-[11rem] sm:rounded-[1.125rem]" />
            <SkeletonBlock className="h-6 w-3/4 max-w-[8rem] rounded-[0.875rem] sm:h-8 sm:max-w-[9rem] sm:rounded-[1rem]" />
          </div>
        </div>

        <div className="mt-5 space-y-2 sm:mt-8">
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-5/6" />
        </div>

        <SkeletonBlock className="mt-8 h-3 w-36 sm:mt-12" />
      </div>
    </Card>
  )
}

export const WorkspaceListLoadingState = ({
  variant = 'mobile',
}: {
  variant?: 'desktop' | 'mobile'
}) => {
  if (variant === 'desktop') {
    return <WorkspaceListDesktopLoadingState />
  }

  return <WorkspaceListMobileLoadingState />
}

const WorkspaceListMobileLoadingState = () => {
  const { t } = useTranslation()

  return (
    <section
      aria-label={t(($) => $.workspaces.labels.loadingWorkspaces)}
      aria-live="polite"
      className={cn(
        mobileLaneClassName,
        mobileBottomNavContentPaddingClassName,
        'flex min-h-screen flex-col px-5 pt-8 sm:px-6 sm:pt-10',
      )}
      role="status"
    >
      <div aria-hidden="true">
        <header className="mb-6 flex items-center justify-between gap-3">
          <SkeletonBlock className="h-10 w-48 max-w-full rounded-compact" />
          <SkeletonBlock className="size-10 shrink-0" />
        </header>

        <div className="space-y-3">
          <WorkspaceCardSkeleton density="compact" />
          <WorkspaceCardSkeleton density="compact" />
          <WorkspaceCardSkeleton density="compact" />
        </div>
      </div>
    </section>
  )
}

const WorkspaceListDesktopLoadingState = () => {
  const { t } = useTranslation()

  return (
    <section
      aria-label={t(($) => $.workspaces.labels.loadingWorkspaces)}
      aria-live="polite"
      role="status"
    >
      <DesktopPageHeaderSkeleton
        rightActionWidths={['w-36']}
        titleClassName="w-72"
      />
      <div aria-hidden="true">
        <div className={workspaceListDesktopGridClassName}>
          {Array.from({ length: 6 }, (_, index) => (
            <WorkspaceCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
