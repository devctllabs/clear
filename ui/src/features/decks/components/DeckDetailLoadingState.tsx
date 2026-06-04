import { SearchBoxSkeleton, StickySearchSkeleton } from '@features/content-search'
import { useTranslation } from 'react-i18next'
import { InventoryList, InventorySection } from '@shared/components/data/InventoryList'
import { SkeletonBlock } from '@shared/components/feedback/SkeletonBlock'
import {
  DesktopAsidePanel,
  DesktopPageHeaderSkeleton,
  desktopDetailGridClassName,
} from '@shared/components/layout/DesktopShell'
import { PageHeaderSkeleton } from '@shared/components/layout/Screen'
import { studyPanelClassName } from '@shared/components/layout/surfaces'
import { Card } from '@shared/components/ui/card'
import { cn } from '@shared/lib/utils'

const noteSkeletonItems = ['first', 'second', 'third'] as const

const NoteRowSkeleton = () => (
  <div className="flex w-full min-w-0 items-stretch gap-0 px-0 py-0">
    <div className="flex min-w-0 flex-1 items-center gap-4 px-5 py-4">
      <SkeletonBlock className="size-10 shrink-0" />
      <div className="min-w-0 flex-1">
        <SkeletonBlock className="h-4 w-full max-w-[12rem]" />
        <div className="mt-1 flex min-w-0 items-center gap-1">
          <SkeletonBlock className="h-5 w-20 shrink-0" />
          <SkeletonBlock className="h-2 w-2 shrink-0" />
          <SkeletonBlock className="h-3 w-24 max-w-full" />
        </div>
      </div>
    </div>
    <div className="flex shrink-0 items-center pr-4">
      <SkeletonBlock className="size-10 shrink-0" />
    </div>
  </div>
)

const DeckStatRailSkeleton = () => (
  <div className="mt-3 grid min-w-0 grid-cols-2 gap-4">
    <div className="min-w-0 space-y-2">
      <SkeletonBlock className="h-2.5 w-10 max-w-full" />
      <SkeletonBlock className="h-4 w-12 max-w-full rounded-[0.875rem]" />
    </div>
    <div className="min-w-0 space-y-2">
      <SkeletonBlock className="h-2.5 w-12 max-w-full" />
      <SkeletonBlock className="h-4 w-16 max-w-full rounded-[0.875rem]" />
    </div>
  </div>
)

export const DeckDetailLoadingState = ({
  backTo,
  variant = 'mobile',
}: {
  backTo?: string
  variant?: 'desktop' | 'mobile'
}) => {
  if (variant === 'desktop') {
    return <DeckDetailDesktopLoadingState backTo={backTo} />
  }

  return <DeckDetailMobileLoadingState backTo={backTo} />
}

const DeckDetailMobileLoadingState = ({ backTo }: { backTo?: string }) => (
  <DeckDetailMobileLoadingContent backTo={backTo} />
)

const DeckDetailMobileLoadingContent = ({ backTo }: { backTo?: string }) => {
  const { t } = useTranslation()

  return (
    <section
      aria-label={t(($) => $.decks.labels.loadingDeck)}
      aria-live="polite"
      className="w-full min-w-0"
      role="status"
    >
    <div className="w-full min-w-0">
      <PageHeaderSkeleton
        backTo={backTo}
        reserveDescriptionSpace
        rightActionWidths={['w-10', 'w-10']}
        titleClassName="max-w-[15rem]"
      />

      <div className="w-full min-w-0 max-w-full space-y-4">
        <Card className={cn(studyPanelClassName, 'space-y-5')}>
          <div className="flex min-w-0 items-center gap-5">
            <SkeletonBlock className="size-[5.75rem] shrink-0" />
            <div className="min-w-0 flex-1">
              <SkeletonBlock className="h-2.5 w-16 max-w-full" />
              <DeckStatRailSkeleton />
            </div>
          </div>
          <SkeletonBlock className="h-12 w-full rounded-full" />
        </Card>

        <StickySearchSkeleton />

        <NoteSectionSkeleton />
      </div>
    </div>
    </section>
  )
}

const DeckDetailDesktopLoadingState = ({ backTo }: { backTo?: string }) => (
  <DeckDetailDesktopLoadingContent backTo={backTo} />
)

const DeckDetailDesktopLoadingContent = ({ backTo }: { backTo?: string }) => {
  const { t } = useTranslation()

  return (
    <section
      aria-label={t(($) => $.decks.labels.loadingDeck)}
      aria-live="polite"
      className="w-full min-w-0"
      role="status"
    >
    <DesktopPageHeaderSkeleton
      backTo={backTo}
      compactBodyGap
      reserveDescriptionSpace
      rightActionWidths={['w-28', 'w-11']}
      titleClassName="w-72"
    />
    <div aria-hidden="true" className={desktopDetailGridClassName}>
      <section className="desktop-detail-main flex min-w-0 max-w-section flex-col xl:max-w-none">
        <SearchBoxSkeleton className="mb-0 mt-0" />
        <div className="mt-8">
          <NoteSectionSkeleton />
        </div>
      </section>
      <div className="desktop-detail-aside desktop-detail-aside-first space-y-4">
        <DesktopAsidePanel
          className={cn('flex min-w-0 flex-col gap-5', studyPanelClassName)}
        >
          <div className="flex min-w-0 items-center gap-4">
            <SkeletonBlock className="size-[5.5rem] shrink-0" />
            <div className="min-w-0 flex-1">
              <SkeletonBlock className="h-2.5 w-20 max-w-full" />
              <DeckStatRailSkeleton />
            </div>
          </div>
          <SkeletonBlock className="h-12 w-full rounded-full" />
        </DesktopAsidePanel>
      </div>
    </div>
    </section>
  )
}

const NoteSectionSkeleton = () => (
  <NoteSectionSkeletonContent />
)

const NoteSectionSkeletonContent = () => {
  const { t } = useTranslation()

  return (
    <InventorySection
      actionSlot={<SkeletonBlock className="h-3.5 w-14 shrink-0" />}
      title={t(($) => $.decks.labels.notes)}
    >
      <InventoryList
        getItemKey={(item) => item}
        items={noteSkeletonItems}
        renderItem={() => <NoteRowSkeleton />}
      />
    </InventorySection>
  )
}
