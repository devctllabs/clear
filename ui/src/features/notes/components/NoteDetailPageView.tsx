import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { Pencil } from 'lucide-react'

import { LoadErrorState } from '@shared/components/feedback/LoadErrorState'
import { BottomNav, type NavigationTarget } from '@shared/components/layout/BottomNav'
import { mobileLaneClassName } from '@shared/components/layout/LayoutLane'
import {
  DesktopAsidePanel,
  DesktopPageHeader,
  DesktopPageHeaderSkeleton,
  DesktopPageLayout,
  desktopDetailContentClassName,
  desktopDetailGridClassName,
} from '@shared/components/layout/DesktopShell'
import { BackControl } from '@shared/components/layout/Screen'
import { SkeletonBlock } from '@shared/components/feedback/SkeletonBlock'
import { Button } from '@shared/components/ui/button'
import { createOpenedFromState } from '@shared/lib/navigation-state'
import { formatRelativeDate, formatRelativeTimestamp } from '@shared/lib/date-format'
import { formatPercentage } from '@shared/lib/number-format'
import { cn } from '@shared/lib/utils'

import { NoteDetailContent } from './NoteDetailContent'
import { NoteDetailHeader } from './NoteDetailHeader'
import { NoteDetailLoadingState } from './NoteDetailLoadingState'
import type { NoteDetail } from '../types/note.types'

export type NoteDetailPageViewProps =
  | {
      backTo: string
      homeTarget: NavigationTarget
      showSkeleton: boolean
      state: 'loading'
    }
  | {
      backTo: string
      error: unknown
      homeTarget: NavigationTarget
      state: 'note-error'
      onRetry: () => void
    }
  | {
      backTo: string
      deckId: string
      deckTitle?: string
      homeTarget: NavigationTarget
      note?: NoteDetail
      noteActionMenu: ReactNode
      noteId: string
      openedFrom: string
      state: 'loaded'
      workspaceId: string
      onDelete: () => void
      onEdit: () => void
    }

export const NoteDetailPageView = ({
  isDesktop,
  view,
}: {
  isDesktop: boolean
  view: NoteDetailPageViewProps
}) => {
  if (isDesktop) {
    return <NoteDetailPageDesktop {...view} />
  }

  return <NoteDetailPageMobile {...view} />
}

const NoteDetailPageDesktop = (props: NoteDetailPageViewProps) => {
  if (props.state === 'loading') {
    return (
      <DesktopPageLayout
        activeItem="home"
        contentClassName={desktopDetailContentClassName}
        homeTarget={props.homeTarget}
      >
        {props.showSkeleton ? <NoteDetailDesktopLoadingState backTo={props.backTo} /> : null}
      </DesktopPageLayout>
    )
  }

  if (props.state === 'note-error') {
    return (
      <DesktopPageLayout
        activeItem="home"
        contentClassName={desktopDetailContentClassName}
        homeTarget={props.homeTarget}
      >
        <DesktopPageHeader backTo={props.backTo} title="Note Details" />
        <LoadErrorState
          error={props.error}
          title="Note could not be loaded"
          onRetry={props.onRetry}
        />
      </DesktopPageLayout>
    )
  }

  return (
    <DesktopPageLayout
      activeItem="home"
      contentClassName={desktopDetailContentClassName}
      homeTarget={props.homeTarget}
    >
      <DesktopPageHeader
        backTo={props.backTo}
        eyebrow="Note Details"
        rightSlot={
          props.note ? (
            <>
              <Button
                className="h-11 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-primary/90"
                type="button"
                variant="default"
                onClick={props.onEdit}
              >
                <Pencil className="size-4" />
                Edit Note
              </Button>
              {props.noteActionMenu}
            </>
          ) : null
        }
        title={props.note?.title ?? 'Note Details'}
      />
      <div className={desktopDetailGridClassName}>
        <section aria-label="Note content" className="desktop-detail-main min-w-0">
          {props.note ? <NoteDetailContent note={props.note} variant="desktop" /> : null}
        </section>
        {props.note ? (
          <div className="desktop-detail-aside space-y-4">
            <NoteDesktopOverview deckTitle={props.deckTitle} note={props.note} />
          </div>
        ) : null}
      </div>
    </DesktopPageLayout>
  )
}

const NoteDetailPageMobile = (props: NoteDetailPageViewProps) => {
  if (props.state === 'loading') {
    return props.showSkeleton ? (
      <NoteDetailLoadingState homeTarget={props.homeTarget} />
    ) : (
      <main id="main-content" className="min-h-screen overflow-x-hidden bg-background" />
    )
  }

  if (props.state === 'note-error') {
    return (
      <main id="main-content" className="min-h-screen overflow-x-hidden bg-background">
        <NoteDetailErrorHeader backTo={props.backTo} />
        <section
          className={cn(mobileLaneClassName, 'min-h-screen px-6 pb-32 pt-28')}
        >
          <LoadErrorState
            error={props.error}
            title="Note could not be loaded"
            onRetry={props.onRetry}
          />
        </section>
        <BottomNav activeItem="home" homeTarget={props.homeTarget} />
      </main>
    )
  }

  return (
    <main id="main-content" className="min-h-screen overflow-x-hidden bg-background">
      {props.note ? (
        <NoteDetailHeader
          backTo={props.backTo}
          note={props.note}
          onDelete={props.onDelete}
          onEdit={props.onEdit}
        />
      ) : null}

      <section
        className={cn(mobileLaneClassName, 'min-h-screen px-6 pb-32 pt-28')}
      >
        {props.note ? <NoteDetailContent note={props.note} /> : null}
        <div className="h-24" />
      </section>

      <div className="fixed bottom-20 left-0 right-0 z-40 bg-gradient-to-t from-background via-background/80 to-transparent pb-6 pt-2">
        <div className={cn(mobileLaneClassName, 'px-6')}>
          <Button
            asChild
            className="type-action h-auto w-full rounded-full bg-primary py-5 text-primary-foreground transition-[opacity,transform] hover:opacity-90 active:scale-[0.98]"
            variant="default"
          >
            <Link
              params={{
                deckId: props.deckId,
                noteId: props.noteId,
                workspaceId: props.workspaceId,
              }}
              state={createOpenedFromState(props.openedFrom)}
              to="/dashboard/$workspaceId/decks/$deckId/notes/$noteId/edit"
            >
              Edit Note
            </Link>
          </Button>
        </div>
      </div>
      <BottomNav activeItem="home" homeTarget={props.homeTarget} />
    </main>
  )
}

const NoteDetailErrorHeader = ({ backTo }: { backTo: string }) => (
  <header className="fixed inset-x-0 top-0 z-50 w-full bg-background/95 backdrop-blur-md">
    <div className={cn(mobileLaneClassName, 'px-6 pb-2 pt-12')}>
      <div className="grid min-h-11 grid-cols-[44px_1fr_44px] items-center">
        <BackControl fallbackTo={backTo} />
        <h1 className="type-row-title text-center text-foreground">
          Note Details
        </h1>
        <div aria-hidden="true" />
      </div>
    </div>
  </header>
)

const NoteDetailDesktopLoadingState = ({ backTo }: { backTo: string }) => (
  <section aria-label="Loading note" aria-live="polite" role="status">
    <DesktopPageHeaderSkeleton
      backTo={backTo}
      rightActionWidths={['w-28', 'w-11']}
      showEyebrow
      titleClassName="w-80"
    />
    <div aria-hidden="true">
      <div className={desktopDetailGridClassName}>
        <article className="desktop-detail-main min-w-0 overflow-hidden rounded-card border border-border bg-card shadow-card">
          <div className="px-8 pt-8">
            <SkeletonBlock className="h-6 w-16 rounded-full" />
          </div>
          <div className="px-8 py-8">
            <SkeletonBlock className="h-3 w-16" />
            <div className="mt-4 space-y-3">
              <SkeletonBlock className="h-5 w-full" />
              <SkeletonBlock className="h-5 w-11/12" />
              <SkeletonBlock className="h-5 w-2/3" />
            </div>
          </div>
          <hr className="mx-8 border-t border-border" />
          <div className="px-8 py-8">
            <SkeletonBlock className="h-3 w-14" />
            <div className="mt-4 space-y-3">
              <SkeletonBlock className="h-5 w-full" />
              <SkeletonBlock className="h-5 w-5/6" />
              <SkeletonBlock className="h-5 w-3/4" />
            </div>
          </div>
        </article>
        <DesktopAsidePanel className="desktop-detail-aside space-y-6">
          <div>
            <div className="flex items-start justify-between gap-3">
              <SkeletonBlock className="h-3 w-28" />
              <SkeletonBlock className="h-6 w-24 rounded-full" />
            </div>
            <SkeletonBlock className="mt-4 h-9 w-20 rounded-[1rem]" />
            <SkeletonBlock className="mt-6 h-1.5 w-full rounded-full" />
          </div>
          <div className="space-y-5 border-t border-border pt-6">
            <div>
              <SkeletonBlock className="h-3 w-12" />
              <SkeletonBlock className="mt-2 h-5 w-20" />
            </div>
            <div>
              <SkeletonBlock className="h-3 w-12" />
              <SkeletonBlock className="mt-2 h-5 w-full" />
            </div>
            <div>
              <SkeletonBlock className="h-3 w-20" />
              <SkeletonBlock className="mt-2 h-5 w-24" />
            </div>
          </div>
        </DesktopAsidePanel>
      </div>
    </div>
  </section>
)

const NoteDesktopOverview = ({
  deckTitle,
  note,
}: {
  deckTitle?: string
  note: NoteDetail
}) => (
  <DesktopAsidePanel aria-label="Note metadata" className="space-y-6" role="complementary">
    <section aria-labelledby="note-study-progress-heading">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <h2
          className="type-label uppercase text-muted-foreground"
          id="note-study-progress-heading"
        >
          Study Progress
        </h2>
        <NoteStatusChip status={note.status} />
      </div>
      <p className="type-metric mt-3 text-foreground">
        {formatPercentage(note.progress)}
      </p>
      <NoteDesktopProgressBar value={note.progress} />
    </section>

    <div className="space-y-5 border-t border-border pt-6">
      {deckTitle ? (
        <NoteMetadataField label="Deck">
          <span className="text-wrap-anywhere">{deckTitle}</span>
        </NoteMetadataField>
      ) : null}
      {note.kind === 'basic' ? (
        <>
          <NoteMetadataField label="Reviewed">
            {formatRelativeTimestamp(note.reviewedAt, 'past')}
          </NoteMetadataField>
          <NoteMetadataField label="Due">
            {formatRelativeTimestamp(note.dueAt, 'future')}
          </NoteMetadataField>
        </>
      ) : null}
      <NoteMetadataField label="Updated">
        {formatRelativeDate(note.updatedAt).replace('Updated ', '')}
      </NoteMetadataField>
    </div>
  </DesktopAsidePanel>
)

const NoteStatusChip = ({ status }: { status: NoteDetail['status'] }) => {
  const label = status === 'mastered' ? 'Mastered' : 'In progress'

  return (
    <span
      className="type-label shrink-0 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-muted-foreground"
    >
      {label}
    </span>
  )
}

const NoteDesktopProgressBar = ({ value }: { value: number }) => (
  <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-muted">
    <div
      className="h-full rounded-full bg-primary"
      style={{ width: formatPercentage(value) }}
    />
  </div>
)

const NoteMetadataField = ({
  children,
  label,
}: {
  children: ReactNode
  label: string
}) => (
  <div>
    <p className="type-label uppercase text-muted-foreground">
      {label}
    </p>
    <p className="mt-1 text-sm font-semibold leading-5 text-foreground">{children}</p>
  </div>
)
