import { useState, type ChangeEventHandler, type ReactNode } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { FolderPlus, Layers3, Pencil, Trash2 } from 'lucide-react'

import { ResourceCreateMenu } from '@features/dashboard/components/ResourceCreateMenu'
import { useDecksInFolder, useDeleteDeck } from '@features/decks/hooks/useDecks'
import { DeckList } from '@features/decks/components/DeckList'
import type { Deck } from '@features/decks'
import {
  SearchBox,
  SearchResults,
  StickySearch,
  useContentSearch,
  useDebouncedValue,
} from '@features/content-search'
import { ActionMenu } from '@shared/components/feedback/ActionMenu'
import { ConfirmDialog } from '@shared/components/feedback/ConfirmDialog'
import { EmptyState } from '@shared/components/feedback/EmptyState'
import {
  BottomStatus,
  BottomStatusStack,
  bottomStatusContentPaddingClassName,
  desktopBottomStatusStackClassName,
  stackedBottomStatusContentPaddingClassName,
} from '@shared/components/feedback/BottomActionErrorStatus'
import { LoadErrorState } from '@shared/components/feedback/LoadErrorState'
import { BottomNav, type NavigationTarget } from '@shared/components/layout/BottomNav'
import {
  DesktopPageHeader,
  DesktopPageLayout,
} from '@shared/components/layout/DesktopShell'
import { AppShell, PageHeader, ScreenCanvas } from '@shared/components/layout/Screen'
import { usePersistedSort } from '@shared/components/data/SortMenu'
import { createOpenedFromState } from '@shared/lib/navigation-state'
import { useDelayedBoolean } from '@shared/hooks/useDelayedBoolean'
import { useIsDesktopLayout } from '@shared/hooks/useAppLayoutMode'

import { FolderList } from '../components/FolderList'
import { FolderDetailLoadingState } from '../components/FolderDetailLoadingState'
import { useDeleteFolder, useFolder, useFoldersInFolder } from '../hooks/useFolders'
import type { Folder } from '../types/folder.types'

export const FolderDetailPage = ({
  folderId,
  workspaceId,
}: {
  folderId: string
  workspaceId: string
}) => {
  const navigate = useNavigate()
  const [folderSort, setFolderSort] = usePersistedSort('workspace-sort:folders')
  const [deckSort, setDeckSort] = usePersistedSort('workspace-sort:decks')
  const folderQuery = useFolder(folderId)
  const foldersQuery = useFoldersInFolder(folderId, folderSort)
  const decksQuery = useDecksInFolder(folderId, deckSort)
  const deleteFolder = useDeleteFolder()
  const deleteDeck = useDeleteDeck()
  const [query, setQuery] = useState('')
  const [pendingFolder, setPendingFolder] = useState<Folder | null>(null)
  const [pendingDeck, setPendingDeck] = useState<Deck | null>(null)
  const debouncedQuery = useDebouncedValue(query, 250)
  const trimmedQuery = debouncedQuery.trim()
  const searchQuery = useContentSearch({ folderId, kind: 'folder' }, debouncedQuery)
  const homeTarget = { to: `/dashboard/${workspaceId}/folders/${folderId}` }
  const currentPagePath = `/dashboard/${workspaceId}/folders/${folderId}`
  const fallbackBackTo = `/dashboard/${workspaceId}`
  const isDesktop = useIsDesktopLayout()

  const isInitialLoading =
    folderQuery.isLoading ||
    (foldersQuery.isLoading && foldersQuery.data === undefined) ||
    (decksQuery.isLoading && decksQuery.data === undefined)
  const showInitialLoading = useDelayedBoolean(isInitialLoading, 180)
  const isSearchLoading = searchQuery.isLoading && searchQuery.data === undefined
  const showSearchLoading = useDelayedBoolean(isSearchLoading, 120)
  const folder = folderQuery.data
  const parentId = folder?.parentId
  const backTo = parentId && parentId !== workspaceId
    ? `/dashboard/${workspaceId}/folders/${parentId}`
    : fallbackBackTo
  const foldersUnavailable = foldersQuery.isError && foldersQuery.data === undefined
  const decksUnavailable = decksQuery.isError && decksQuery.data === undefined
  const folders = foldersQuery.data ?? []
  const decks = decksQuery.data ?? []
  const isFolderEmpty =
    trimmedQuery.length === 0 &&
    foldersQuery.data !== undefined &&
    decksQuery.data !== undefined &&
    !foldersUnavailable &&
    !decksUnavailable &&
    folders.length === 0 &&
    decks.length === 0
  const openCreateDeck = () => {
    void navigate({
      params: { entityKind: 'deck', folderId, workspaceId },
      state: createOpenedFromState(currentPagePath),
      to: '/dashboard/$workspaceId/folders/$folderId/create/$entityKind',
    })
  }
  const openCreateFolder = () => {
    void navigate({
      params: { entityKind: 'folder', folderId, workspaceId },
      state: createOpenedFromState(currentPagePath),
      to: '/dashboard/$workspaceId/folders/$folderId/create/$entityKind',
    })
  }
  const openDeleteFolderDialog = (folder: Folder) => {
    deleteFolder.reset()
    setPendingFolder(folder)
  }
  const closeDeleteFolderDialog = () => {
    setPendingFolder(null)
    deleteFolder.reset()
  }
  const openDeleteDeckDialog = (deck: Deck) => {
    deleteDeck.reset()
    setPendingDeck(deck)
  }
  const closeDeleteDeckDialog = () => {
    setPendingDeck(null)
    deleteDeck.reset()
  }
  const handleQueryChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setQuery(event.target.value)
  }
  const clearSearch = () => {
    setQuery('')
  }

  const folderActionMenu = folder ? (
    <ActionMenu
      dialogLabel={`${folder.name} actions`}
      items={[
        {
          icon: <Pencil className="size-4 stroke-[2.4]" />,
          label: 'Edit',
          onSelect: () => {
            void navigate({
              params: { folderId: folder.id, workspaceId },
              state: createOpenedFromState(currentPagePath),
              to: '/dashboard/$workspaceId/folders/$folderId/edit',
            })
          },
        },
        {
          icon: <Trash2 className="size-4 stroke-[2.2]" />,
          label: 'Delete',
          onSelect: () => openDeleteFolderDialog(folder),
          tone: 'danger',
        },
      ]}
      triggerAriaLabel={`${folder.name} actions`}
      triggerClassName="text-foreground hover:bg-muted"
    />
  ) : null
  const searchResults = (
    <SearchResults
      key={debouncedQuery}
      emptyDescription={`No folders, decks, or notes matched "${trimmedQuery}".`}
      emptyTitle="No matches in this folder"
      error={searchQuery.error}
      groups={searchQuery.data}
      loading={showSearchLoading}
      query={debouncedQuery}
      onClearSearch={clearSearch}
      onRetry={() => {
        void searchQuery.refetch()
      }}
    />
  )
  const hasFolderRefreshError = foldersQuery.isError && foldersQuery.data !== undefined
  const hasDeckRefreshError = decksQuery.isError && decksQuery.data !== undefined
  const hasBottomStatus = hasFolderRefreshError || hasDeckRefreshError
  const bottomStatusCount = [hasFolderRefreshError, hasDeckRefreshError].filter(Boolean).length
  const bottomStatusScreenClassName =
    bottomStatusCount > 1
      ? stackedBottomStatusContentPaddingClassName
      : hasBottomStatus
        ? bottomStatusContentPaddingClassName
        : undefined
  const showFolderSection = foldersUnavailable || folders.length > 0
  const showDeckSection = decksUnavailable || decks.length > 0
  const emptyFolderState = (
    <EmptyState
      actions={[
        {
          icon: <Layers3 className="size-4" />,
          label: 'New deck',
          onClick: openCreateDeck,
        },
        {
          icon: <FolderPlus className="size-4" />,
          label: 'New folder',
          onClick: openCreateFolder,
          variant: 'outline',
        },
      ]}
      description="Create a deck, then add notes to build a review queue."
      icon={<Layers3 className="size-6" />}
      title="Create your first deck"
    />
  )
  const folderSection = foldersUnavailable ? (
    <LoadErrorState
      error={foldersQuery.error}
      title="Folders could not be loaded"
      onRetry={() => {
        void foldersQuery.refetch()
      }}
    />
  ) : (
    <FolderList
      folders={folders}
      openedFrom={currentPagePath}
      sort={folderSort}
      workspaceId={workspaceId}
      onDelete={openDeleteFolderDialog}
      onSortChange={setFolderSort}
    />
  )
  const decksSection = decksUnavailable ? (
    <LoadErrorState
      error={decksQuery.error}
      title="Decks could not be loaded"
      onRetry={() => {
        void decksQuery.refetch()
      }}
    />
  ) : (
    <DeckList
      decks={decks}
      openedFrom={currentPagePath}
      sort={deckSort}
      onDelete={openDeleteDeckDialog}
      onSortChange={setDeckSort}
    />
  )
  const viewProps: FolderDetailPageViewProps = isInitialLoading
    ? {
        backTo,
        homeTarget,
        showSkeleton: showInitialLoading,
        state: 'loading',
      }
    : folderQuery.isError && !folder
      ? {
          backTo: fallbackBackTo,
          error: folderQuery.error,
          homeTarget,
          onRetry: () => {
            void folderQuery.refetch()
          },
          state: 'folder-error',
        }
      : {
          backTo,
          currentPagePath,
          decksSection,
          description: folder?.description,
          emptyState: isFolderEmpty ? emptyFolderState : null,
          folderActionMenu,
          folderId,
          folderSection,
          homeTarget,
          query,
          searchActive: trimmedQuery.length > 0,
          searchResults,
          screenClassName: bottomStatusScreenClassName,
          showDeckSection,
          showFolderSection,
          state: 'loaded',
          title: folder?.name ?? 'Folder',
          workspaceId,
          onCreateDeck: openCreateDeck,
          onCreateFolder: openCreateFolder,
          onQueryChange: handleQueryChange,
        }

  const page = isDesktop ? (
    <FolderDetailPageDesktop {...viewProps} />
  ) : (
    <FolderDetailPageMobile {...viewProps} />
  )

  return (
    <>
      {page}
      <ConfirmDialog
        actionError={
          deleteFolder.isError
            ? { error: deleteFolder.error, title: 'Could not delete folder' }
            : null
        }
        confirmLabel="Delete folder"
        confirming={deleteFolder.isPending}
        description={
          pendingFolder
            ? `This moves "${pendingFolder.name}" to Trash. You can restore it later.`
            : ''
        }
        open={pendingFolder !== null}
        title={pendingFolder ? `Delete "${pendingFolder.name}"?` : 'Delete folder?'}
        onConfirm={() => {
          if (pendingFolder) {
            const shouldClosePage = pendingFolder.id === folder?.id
            deleteFolder.mutate(pendingFolder.id, {
              onSuccess: () => {
                setPendingFolder(null)
                if (shouldClosePage) {
                  void navigate({ to: backTo as never })
                }
              },
            })
          }
        }}
        onOpenChange={(open) => {
          if (!open) {
            closeDeleteFolderDialog()
          }
        }}
      />
      <ConfirmDialog
        actionError={
          deleteDeck.isError
            ? { error: deleteDeck.error, title: 'Could not delete deck' }
            : null
        }
        confirmLabel="Delete deck"
        confirming={deleteDeck.isPending}
        description={
          pendingDeck
            ? `This moves "${pendingDeck.title}" to Trash. You can restore it later.`
            : ''
        }
        open={pendingDeck !== null}
        title={pendingDeck ? `Delete "${pendingDeck.title}"?` : 'Delete deck?'}
        onConfirm={() => {
          if (pendingDeck) {
            deleteDeck.mutate(pendingDeck.id, {
              onSuccess: () => {
                setPendingDeck(null)
              },
            })
          }
        }}
        onOpenChange={(open) => {
          if (!open) {
            closeDeleteDeckDialog()
          }
        }}
      />
      {hasBottomStatus ? (
        <BottomStatusStack className={isDesktop ? desktopBottomStatusStackClassName : undefined}>
          {hasFolderRefreshError ? (
            <BottomStatus
              actionLabel="Check again"
              dismissKey={foldersQuery.errorUpdateCount}
              error={foldersQuery.error}
              title="Folders may be out of date"
              onAction={() => {
                void foldersQuery.refetch()
              }}
            />
          ) : null}
          {hasDeckRefreshError ? (
            <BottomStatus
              actionLabel="Check again"
              dismissKey={decksQuery.errorUpdateCount}
              error={decksQuery.error}
              title="Decks may be out of date"
              onAction={() => {
                void decksQuery.refetch()
              }}
            />
          ) : null}
        </BottomStatusStack>
      ) : null}
    </>
  )
}

type FolderDetailPageViewProps =
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
      state: 'folder-error'
      onRetry: () => void
    }
  | {
      backTo: string
      currentPagePath: string
      decksSection: ReactNode
      description?: string
      emptyState: ReactNode
      folderActionMenu: ReactNode
      folderId: string
      folderSection: ReactNode
      homeTarget: NavigationTarget
      query: string
      searchActive: boolean
      searchResults: ReactNode
      screenClassName?: string
      showDeckSection: boolean
      showFolderSection: boolean
      state: 'loaded'
      title: string
      workspaceId: string
      onCreateDeck: () => void
      onCreateFolder: () => void
      onQueryChange: ChangeEventHandler<HTMLInputElement>
    }

const FolderDetailPageDesktop = (props: FolderDetailPageViewProps) => {
  if (props.state === 'loading') {
    return (
      <DesktopPageLayout activeItem="home" homeTarget={props.homeTarget}>
        {props.showSkeleton ? (
          <FolderDetailLoadingState backTo={props.backTo} variant="desktop" />
        ) : null}
      </DesktopPageLayout>
    )
  }

  if (props.state === 'folder-error') {
    return (
      <DesktopPageLayout activeItem="home" homeTarget={props.homeTarget}>
        <DesktopPageHeader backTo={props.backTo} title="Folder" />
        <LoadErrorState
          error={props.error}
          title="Folder could not be loaded"
          onRetry={props.onRetry}
        />
      </DesktopPageLayout>
    )
  }

  return (
    <DesktopPageLayout activeItem="home" homeTarget={props.homeTarget}>
      <DesktopPageHeader
        backTo={props.backTo}
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
            {props.folderActionMenu}
          </>
        }
        searchSlot={
          <SearchBox
            className="mb-0 mt-0"
            onChange={props.onQueryChange}
            placeholder="Search folders, decks, and notes…"
            value={props.query}
          />
        }
        title={props.title}
      />
      <section className="min-w-0">
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

const FolderDetailPageMobile = (props: FolderDetailPageViewProps) => {
  if (props.state === 'loading') {
    return (
      <AppShell>
        <ScreenCanvas>
          {props.showSkeleton ? (
            <FolderDetailLoadingState backTo={props.backTo} variant="mobile" />
          ) : null}
        </ScreenCanvas>
        <BottomNav activeItem="home" homeTarget={props.homeTarget} />
      </AppShell>
    )
  }

  if (props.state === 'folder-error') {
    return (
      <AppShell>
        <ScreenCanvas>
          <PageHeader backTo={props.backTo} title="Folder" />
          <LoadErrorState
            error={props.error}
            title="Folder could not be loaded"
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
          compactBodyGap
          description={props.description}
          reserveDescriptionSpace={false}
          rightSlot={
            <div className="flex items-center gap-2">
              {props.emptyState === null ? (
                <ResourceCreateMenu
                  label="Create"
                  variant="responsive"
                  onCreateDeck={props.onCreateDeck}
                  onCreateFolder={props.onCreateFolder}
                />
              ) : null}
              {props.folderActionMenu}
            </div>
          }
          title={props.title}
        />
        <StickySearch
          onChange={props.onQueryChange}
          placeholder="Search folders, decks, and notes…"
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
