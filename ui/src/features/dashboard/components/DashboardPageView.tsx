import type { ChangeEventHandler, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { SearchBox, StickySearch } from '@features/content-search'
import { LoadErrorState } from '@shared/components/feedback/LoadErrorState'
import {
  DesktopPageHeader,
  DesktopPageLayout,
} from '@shared/components/layout/DesktopShell'
import { AppShell, PageHeader, ScreenCanvas } from '@shared/components/layout/Screen'
import { BottomNav, type NavigationTarget } from '@shared/components/layout/BottomNav'

import { DashboardLoadingState } from './DashboardLoadingState'
import { ResourceCreateMenu } from './ResourceCreateMenu'

export type DashboardPageViewProps =
  | {
      homeTarget: NavigationTarget
      showSkeleton: boolean
      state: 'loading'
    }
  | {
      error: unknown
      homeTarget: NavigationTarget
      state: 'workspace-error'
      onRetry: () => void
    }
  | {
      currentPagePath: string
      decksSection: ReactNode
      description: string
      folderSection: ReactNode
      homeTarget: NavigationTarget
      emptyState: ReactNode
      query: string
      searchActive: boolean
      searchResults: ReactNode
      screenClassName?: string
      showDeckSection: boolean
      showFolderSection: boolean
      state: 'loaded'
      title: string
      workspaceActionMenu: ReactNode
      workspaceId: string
      onCreateDeck: () => void
      onCreateFolder: () => void
      onQueryChange: ChangeEventHandler<HTMLInputElement>
    }

export const DashboardPageView = ({
  isDesktop,
  view,
}: {
  isDesktop: boolean
  view: DashboardPageViewProps
}) => {
  if (isDesktop) {
    return <DashboardPageDesktop {...view} />
  }

  return <DashboardPageMobile {...view} />
}

const DashboardPageDesktop = (props: DashboardPageViewProps) => {
  const { t } = useTranslation()

  if (props.state === 'loading') {
    return (
      <DesktopPageLayout activeItem="home" homeTarget={props.homeTarget}>
        {props.showSkeleton ? <DashboardLoadingState variant="desktop" /> : null}
      </DesktopPageLayout>
    )
  }

  if (props.state === 'workspace-error') {
    return (
      <DesktopPageLayout activeItem="home" homeTarget={props.homeTarget}>
        <DesktopPageHeader title={t(($) => $.dashboard.labels.dashboard)} />
        <LoadErrorState
          error={props.error}
          title={t(($) => $.dashboard.errors.workspaceCouldNotLoad)}
          onRetry={props.onRetry}
        />
      </DesktopPageLayout>
    )
  }

  return (
    <DesktopPageLayout activeItem="home" homeTarget={props.homeTarget}>
      <DesktopPageHeader
        description={props.description}
        reserveDescriptionSpace
        rightSlot={
          <>
            {props.emptyState === null ? (
              <ResourceCreateMenu
                onCreateDeck={props.onCreateDeck}
                onCreateFolder={props.onCreateFolder}
              />
            ) : null}
            {props.workspaceActionMenu}
          </>
        }
        searchSlot={
          <SearchBox
            className="mb-0 mt-0"
            onChange={props.onQueryChange}
            placeholder={t(($) => $.dashboard.descriptions.searchPlaceholder)}
            value={props.query}
          />
        }
        title={props.title}
      />
      <section className="min-w-0 space-y-4">
        {props.searchActive ? (
          <div className="max-w-section">{props.searchResults}</div>
        ) : props.emptyState ? (
          <div className="max-w-section">{props.emptyState}</div>
        ) : props.showFolderSection ? (
          <div className="grid w-full max-w-section min-w-0 gap-8">
            {props.folderSection}
            {props.showDeckSection ? props.decksSection : null}
          </div>
        ) : props.showDeckSection ? (
          <div className="max-w-section">{props.decksSection}</div>
        ) : null}
      </section>
    </DesktopPageLayout>
  )
}

const DashboardPageMobile = (props: DashboardPageViewProps) => {
  const { t } = useTranslation()

  if (props.state === 'loading') {
    return (
      <AppShell>
        <ScreenCanvas>
          {props.showSkeleton ? <DashboardLoadingState variant="mobile" /> : null}
        </ScreenCanvas>
        <BottomNav activeItem="home" homeTarget={props.homeTarget} />
      </AppShell>
    )
  }

  if (props.state === 'workspace-error') {
    return (
      <AppShell>
        <ScreenCanvas>
          <PageHeader title={t(($) => $.dashboard.labels.dashboard)} />
          <LoadErrorState
            error={props.error}
            title={t(($) => $.dashboard.errors.workspaceCouldNotLoad)}
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
          compactBodyGap
          description={props.description}
          reserveDescriptionSpace={false}
          rightSlot={
            <div className="flex items-center gap-2">
              {props.emptyState === null ? (
                <ResourceCreateMenu
                  variant="responsive"
                  onCreateDeck={props.onCreateDeck}
                  onCreateFolder={props.onCreateFolder}
                />
              ) : null}
              {props.workspaceActionMenu}
            </div>
          }
          title={props.title}
        />
        <StickySearch
          onChange={props.onQueryChange}
          placeholder={t(($) => $.dashboard.descriptions.searchPlaceholder)}
          value={props.query}
        />
        <div>
          {props.searchActive ? (
            props.searchResults
          ) : props.emptyState ? (
            props.emptyState
          ) : (
            <div className="grid w-full min-w-0 gap-6 sm:gap-8">
              {props.folderSection}
              {props.decksSection}
            </div>
          )}
        </div>
      </ScreenCanvas>
      <BottomNav activeItem="home" homeTarget={props.homeTarget} />
    </AppShell>
  )
}
