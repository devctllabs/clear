import { StickySearchSkeleton } from '@features/content-search'
import { InventoryList, InventorySection } from '@shared/components/data/InventoryList'
import { SkeletonBlock } from '@shared/components/feedback/SkeletonBlock'
import { DesktopPageHeaderSkeleton } from '@shared/components/layout/DesktopShell'
import { PageHeaderSkeleton } from '@shared/components/layout/Screen'

const sectionSkeletonItems = ['first', 'second'] as const

const FolderRowSkeleton = () => (
  <div className="flex w-full min-w-0 items-stretch">
    <div className="flex min-w-0 flex-1 items-center gap-4 px-5 py-4">
      <SkeletonBlock className="size-6 shrink-0" />
      <div className="min-w-0 flex-1 space-y-2">
        <SkeletonBlock className="h-4 w-full max-w-[13rem]" />
        <SkeletonBlock className="h-3 w-24" />
      </div>
    </div>
    <div className="flex shrink-0 items-center pr-4">
      <SkeletonBlock className="size-10 shrink-0" />
    </div>
  </div>
)

const DeckRowSkeleton = () => (
  <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-3 px-4 py-4 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto] sm:gap-x-4 sm:px-5">
    <SkeletonBlock className="size-10 shrink-0" />
    <div className="min-w-0 space-y-2">
      <SkeletonBlock className="h-4 w-full max-w-[11rem]" />
      <SkeletonBlock className="h-3 w-24 max-w-full" />
    </div>
    <SkeletonBlock className="size-8 shrink-0 justify-self-end" />
    <div className="col-span-2 col-start-2 flex min-w-0 items-center gap-2 sm:col-span-1 sm:col-start-auto sm:justify-end">
      <div className="flex min-w-8 shrink-0 flex-col items-start gap-1">
        <SkeletonBlock className="h-2.5 w-7" />
        <SkeletonBlock className="h-3 w-6 rounded-[0.375rem]" />
      </div>
      <SkeletonBlock className="size-[2.125rem] shrink-0" />
      <SkeletonBlock className="h-9 w-20 rounded-full sm:h-10" />
    </div>
  </div>
)

export const DashboardLoadingState = ({
  variant = 'mobile',
}: {
  variant?: 'desktop' | 'mobile'
}) => {
  if (variant === 'desktop') {
    return <DashboardDesktopLoadingState />
  }

  return <DashboardMobileLoadingState />
}

const DashboardMobileLoadingState = () => (
  <section
    aria-label="Loading dashboard"
    aria-live="polite"
    className="w-full min-w-0"
    role="status"
  >
    <PageHeaderSkeleton
      compactBodyGap
      reserveDescriptionSpace
      rightActionWidths={['w-10', 'w-10']}
      titleClassName="max-w-[16rem]"
    />
    <StickySearchSkeleton />
    <div className="grid w-full min-w-0 gap-6 sm:gap-8">
      <FolderSectionSkeleton />
      <DeckSectionSkeleton />
    </div>
  </section>
)

const DashboardDesktopLoadingState = () => (
  <section
    aria-label="Loading dashboard"
    aria-live="polite"
    className="w-full min-w-0"
    role="status"
  >
    <DesktopPageHeaderSkeleton
      reserveDescriptionSpace
      rightActionWidths={['w-28', 'w-11']}
      search
      titleClassName="w-80"
    />
    <div aria-hidden="true" className="min-w-0 space-y-4">
      <div className="grid w-full max-w-section min-w-0 gap-8">
        <FolderSectionSkeleton />
        <DeckSectionSkeleton />
      </div>
    </div>
  </section>
)

const FolderSectionSkeleton = () => (
  <InventorySection
    actionSlot={<SkeletonBlock className="size-8 shrink-0" />}
    title="Folders"
  >
    <InventoryList
      getItemKey={(item) => item}
      items={sectionSkeletonItems}
      renderItem={() => <FolderRowSkeleton />}
    />
  </InventorySection>
)

const DeckSectionSkeleton = () => (
  <InventorySection
    actionSlot={<SkeletonBlock className="size-8 shrink-0" />}
    title="Decks"
  >
    <InventoryList
      getItemKey={(item) => item}
      items={sectionSkeletonItems}
      renderItem={() => <DeckRowSkeleton />}
    />
  </InventorySection>
)
