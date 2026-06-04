import {
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  type ChangeEventHandler,
  type ReactNode,
} from 'react'
import { Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import {
  getNoteKindLabel,
  noteCreateOptions,
} from '@features/notes/components/noteCreateOptions'
import type { NoteKind } from '@features/notes'
import { LoadErrorState } from '@shared/components/feedback/LoadErrorState'
import { BottomNav, type NavigationTarget } from '@shared/components/layout/BottomNav'
import {
  DesktopAsidePanel,
  DesktopPageHeader,
  DesktopPageLayout,
  desktopDetailContentClassName,
  desktopDetailGridClassName,
} from '@shared/components/layout/DesktopShell'
import { AppShell, PageHeader, ScreenCanvas } from '@shared/components/layout/Screen'
import { ProgressRing } from '@shared/components/data/ProgressRing'
import { Button } from '@shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  dropdownMenuItemClassName,
} from '@shared/components/ui/dropdown-menu'
import {
  responsiveActionButtonClassName,
} from '@shared/components/ui/responsive-action'
import { cn } from '@shared/lib/utils'

import { DeckDetailLoadingState } from './DeckDetailLoadingState'
import { DeckNotesSearchSection } from './DeckNotesSearchSection'
import { DeckStatRail, DeckSummary } from './DeckSummary'
import type { DeckDetail } from '../types/deck.types'

export type DeckDetailPageViewProps =
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
      state: 'deck-error'
      onRetry: () => void
    }
  | {
      backTo: string
      currentPagePath: string
      deck?: DeckDetail
      deckActionMenu: ReactNode
      deckId: string
      homeTarget: NavigationTarget
      notesContent: ReactNode
      notesEmpty: boolean
      query: string
      searchActive: boolean
      screenClassName?: string
      state: 'loaded'
      studyNowTo: string
      workspaceId: string
      onCreateNote: (kind: NoteKind) => void
      onQueryChange: ChangeEventHandler<HTMLInputElement>
    }

export const DeckDetailPageView = ({
  isDesktop,
  view,
}: {
  isDesktop: boolean
  view: DeckDetailPageViewProps
}) => {
  if (isDesktop) {
    return <DeckDetailPageDesktop {...view} />
  }

  return <DeckDetailPageMobile {...view} />
}

const DeckDetailPageDesktop = (props: DeckDetailPageViewProps) => {
  const { t } = useTranslation()
  const notesContentRef = useRef<HTMLDivElement>(null)
  const overviewRef = useRef<HTMLDivElement>(null)

  const measureEmptyNotesContent = useCallback(() => {
    const notesContent = notesContentRef.current

    if (!notesContent) {
      return
    }

    if (props.state !== 'loaded' || !props.notesEmpty) {
      notesContent.style.height = ''
      notesContent.style.minHeight = ''
      return
    }

    const overview = overviewRef.current

    if (!overview) {
      notesContent.style.height = ''
      notesContent.style.minHeight = ''
      return
    }

    const notesContentTop = notesContent.getBoundingClientRect().top
    const overviewBottom = overview.getBoundingClientRect().bottom
    const nextHeight = overviewBottom - notesContentTop

    if (nextHeight <= 0) {
      notesContent.style.height = ''
      notesContent.style.minHeight = ''
      return
    }

    notesContent.style.height = ''
    notesContent.style.minHeight = `${nextHeight}px`
  }, [props])

  const setNotesContentElement = useCallback(
    (element: HTMLDivElement | null) => {
      notesContentRef.current = element
      measureEmptyNotesContent()
    },
    [measureEmptyNotesContent],
  )

  const setOverviewElement = useCallback(
    (element: HTMLDivElement | null) => {
      overviewRef.current = element
      measureEmptyNotesContent()
    },
    [measureEmptyNotesContent],
  )

  useLayoutEffect(() => {
    measureEmptyNotesContent()

    if (props.state !== 'loaded' || !props.notesEmpty) {
      return undefined
    }

    let frame = 0
    const scheduleMeasure = () => {
      if (frame) {
        window.cancelAnimationFrame(frame)
      }

      frame = window.requestAnimationFrame(measureEmptyNotesContent)
    }

    window.addEventListener('resize', scheduleMeasure)

    if (typeof ResizeObserver === 'undefined') {
      return () => {
        if (frame) {
          window.cancelAnimationFrame(frame)
        }
        window.removeEventListener('resize', scheduleMeasure)
      }
    }

    const observer = new ResizeObserver(scheduleMeasure)
    if (notesContentRef.current) {
      observer.observe(notesContentRef.current)
    }
    if (overviewRef.current) {
      observer.observe(overviewRef.current)
    }

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame)
      }
      observer.disconnect()
      window.removeEventListener('resize', scheduleMeasure)
    }
  }, [measureEmptyNotesContent, props])

  if (props.state === 'loading') {
    return (
      <DesktopPageLayout
        activeItem="home"
        contentClassName={desktopDetailContentClassName}
        homeTarget={props.homeTarget}
      >
        {props.showSkeleton ? (
          <DeckDetailLoadingState backTo={props.backTo} variant="desktop" />
        ) : null}
      </DesktopPageLayout>
    )
  }

  if (props.state === 'deck-error') {
    return (
      <DesktopPageLayout
        activeItem="home"
        contentClassName={desktopDetailContentClassName}
        homeTarget={props.homeTarget}
      >
        <DesktopPageHeader backTo={props.backTo} title={t(($) => $.decks.labels.deck)} />
        <LoadErrorState
          error={props.error}
          title={t(($) => $.decks.errors.deckCouldNotLoad)}
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
        compactBodyGap
        description={props.deck?.description}
        reserveDescriptionSpace
        rightSlot={
          <>
            {props.notesEmpty ? null : (
              <DeckCreateNoteMenu onCreateNote={props.onCreateNote} />
            )}
            {props.deckActionMenu}
          </>
        }
        title={props.deck?.title ?? t(($) => $.decks.labels.deck)}
      />
      <div className={desktopDetailGridClassName}>
        <DeckNotesSearchSection
          contentRef={setNotesContentElement}
          query={props.query}
          variant="desktop"
          onQueryChange={props.onQueryChange}
        >
          {props.notesContent}
        </DeckNotesSearchSection>
        {props.deck ? (
          <div
            className="desktop-detail-aside desktop-detail-aside-first space-y-4"
            ref={setOverviewElement}
          >
            <DeckDesktopOverview
              deck={props.deck}
              stretch={props.notesEmpty}
              studyNowTo={props.studyNowTo}
            />
          </div>
        ) : null}
      </div>
    </DesktopPageLayout>
  )
}

const DeckCreateNoteMenu = ({
  onCreateNote,
  variant = 'default',
}: {
  onCreateNote: (kind: NoteKind) => void
  variant?: 'default' | 'responsive'
}) => {
  const { t } = useTranslation()
  const labelId = useId()
  const isResponsive = variant === 'responsive'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={isResponsive ? t(($) => $.decks.actions.createNote) : undefined}
          className={
            isResponsive
              ? `${responsiveActionButtonClassName} bg-primary text-primary-foreground hover:bg-primary/90`
              : 'h-11 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-primary/90'
          }
          type="button"
          variant="default"
        >
          <Plus className="size-4" />
          {isResponsive ? null : t(($) => $.common.actions.create)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        aria-labelledby={labelId}
        className="max-w-[calc(100vw-2rem)] min-w-[13rem] rounded-compact border border-border bg-popover p-2 shadow-floating"
        sideOffset={8}
      >
        <DropdownMenuLabel
          className="type-label px-3 pb-2 pt-2 uppercase text-muted-foreground"
          id={labelId}
        >
          {t(($) => $.decks.actions.newNote)}
        </DropdownMenuLabel>
        {noteCreateOptions.map(({ Icon, kind }) => (
          <DropdownMenuItem
            className={dropdownMenuItemClassName()}
            key={kind}
            onSelect={() => onCreateNote(kind)}
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
              <Icon className="size-4" />
            </span>
            <span className="line-clamp-2 text-wrap-anywhere type-row-title min-w-0 flex-1">
              {getNoteKindLabel(t, kind)}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const DeckDetailPageMobile = (props: DeckDetailPageViewProps) => {
  const { t } = useTranslation()

  if (props.state === 'loading') {
    return (
      <AppShell>
        <ScreenCanvas>
          {props.showSkeleton ? (
            <DeckDetailLoadingState backTo={props.backTo} variant="mobile" />
          ) : null}
        </ScreenCanvas>
        <BottomNav activeItem="home" homeTarget={props.homeTarget} />
      </AppShell>
    )
  }

  if (props.state === 'deck-error') {
    return (
      <AppShell>
        <ScreenCanvas>
          <PageHeader backTo={props.backTo} title={t(($) => $.decks.labels.deck)} />
          <LoadErrorState
            error={props.error}
            title={t(($) => $.decks.errors.deckCouldNotLoad)}
            onRetry={props.onRetry}
          />
        </ScreenCanvas>
        <BottomNav activeItem="home" homeTarget={props.homeTarget} />
      </AppShell>
    )
  }

  return (
    <AppShell>
      <ScreenCanvas className={props.screenClassName}>
        <PageHeader
          backTo={props.backTo}
          description={props.deck?.description}
          rightSlot={
            <div className="flex items-center gap-2">
              {props.notesEmpty ? null : (
                <DeckCreateNoteMenu
                  variant="responsive"
                  onCreateNote={props.onCreateNote}
                />
              )}
              {props.deckActionMenu}
            </div>
          }
          title={props.deck?.title ?? t(($) => $.decks.labels.deck)}
        />
        <div className="space-y-4">
          {props.deck ? <DeckSummary deck={props.deck} studyNowTo={props.studyNowTo} /> : null}
          <DeckNotesSearchSection
            query={props.query}
            searchActive={props.searchActive}
            variant="mobile"
            onQueryChange={props.onQueryChange}
          >
            {props.notesContent}
          </DeckNotesSearchSection>
        </div>
      </ScreenCanvas>
      <BottomNav activeItem="home" homeTarget={props.homeTarget} />
    </AppShell>
  )
}

const DeckDesktopOverview = ({
  deck,
  stretch = false,
  studyNowTo,
}: {
  deck: DeckDetail
  stretch?: boolean
  studyNowTo: string
}) => {
  const { t } = useTranslation()

  return (
  <DesktopAsidePanel
    aria-label={t(($) => $.decks.labels.deckOverview)}
    className={cn('flex flex-col gap-5', stretch && 'h-full')}
    role="complementary"
  >
    <div className="flex min-w-0 items-center gap-4">
      <ProgressRing
        radius={40}
        size={88}
        strokeWidth={5}
        value={deck.progress}
        valueClassName="type-technical text-base font-bold"
      />
      <div className="min-w-0 flex-1">
        <p className="type-label uppercase text-muted-foreground">
          <DeckMasteryLabel />
        </p>
        <DeckStatRail className="mt-3" deck={deck} />
      </div>
    </div>
    <Button
      asChild
      className="type-action h-12 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
      variant="default"
    >
      <DeckStudyNowLabel to={studyNowTo} />
    </Button>
  </DesktopAsidePanel>
  )
}

const DeckMasteryLabel = () => {
  const { t } = useTranslation()

  return t(($) => $.decks.labels.mastery)
}

const DeckStudyNowLabel = ({ to }: { to: string }) => {
  const { t } = useTranslation()

  return <Link to={to as never}>{t(($) => $.decks.actions.studyNow)}</Link>
}
