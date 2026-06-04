import { useNavigate } from '@tanstack/react-router'
import { FolderPlus, Layers3, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState, type ChangeEventHandler, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { useDeleteDeck, useWorkspaceRootDecks } from '@features/decks/hooks/useDecks'
import { DeckList } from '@features/decks/components/DeckList'
import type { Deck } from '@features/decks'
import {
  SearchResults,
  useContentSearch,
  useDebouncedValue,
} from '@features/content-search'
import {
  useDeleteFolder,
  useWorkspaceRootFolders,
} from '@features/folders/hooks/useFolders'
import { FolderList } from '@features/folders/components/FolderList'
import type { Folder } from '@features/folders'
import {
  useActiveWorkspaceId,
  useDeleteWorkspace,
  useSetActiveWorkspace,
  useWorkspace,
} from '@features/workspaces/hooks/useWorkspaces'
import type { Workspace } from '@features/workspaces'
import { EmptyState } from '@shared/components/feedback/EmptyState'
import { ActionMenu } from '@shared/components/feedback/ActionMenu'
import {
  BottomStatus,
  BottomStatusStack,
  bottomStatusContentPaddingClassName,
  desktopBottomStatusStackClassName,
  stackedBottomStatusContentPaddingClassName,
} from '@shared/components/feedback/BottomActionErrorStatus'
import { LoadErrorState } from '@shared/components/feedback/LoadErrorState'
import { usePersistedSort } from '@shared/components/data/SortMenu'
import { useDelayedBoolean } from '@shared/hooks/useDelayedBoolean'
import { useIsDesktopLayout } from '@shared/hooks/useAppLayoutMode'
import { createOpenedFromState } from '@shared/lib/navigation-state'

import { DashboardDeleteDialogs } from '../components/DashboardDeleteDialogs'
import {
  DashboardPageView,
  type DashboardPageViewProps,
} from '../components/DashboardPageView'

export const DashboardPage = ({ workspaceId }: { workspaceId: string }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [folderSort, setFolderSort] = usePersistedSort('workspace-sort:folders')
  const [deckSort, setDeckSort] = usePersistedSort('workspace-sort:decks')
  const workspaceQuery = useWorkspace(workspaceId)
  const activeWorkspaceIdQuery = useActiveWorkspaceId()
  const foldersQuery = useWorkspaceRootFolders(workspaceId, folderSort)
  const decksQuery = useWorkspaceRootDecks(workspaceId, deckSort)
  const setActiveWorkspace = useSetActiveWorkspace()
  const setActiveWorkspaceId = setActiveWorkspace.mutate
  const deleteWorkspace = useDeleteWorkspace()
  const deleteFolder = useDeleteFolder()
  const deleteDeck = useDeleteDeck()
  const [query, setQuery] = useState('')
  const [pendingWorkspace, setPendingWorkspace] = useState<Workspace | null>(null)
  const [pendingFolder, setPendingFolder] = useState<Folder | null>(null)
  const [pendingDeck, setPendingDeck] = useState<Deck | null>(null)
  const debouncedQuery = useDebouncedValue(query, 250)
  const searchQuery = useContentSearch({ kind: 'workspace', workspaceId }, debouncedQuery)
  const trimmedQuery = debouncedQuery.trim()
  const homeTarget = { to: `/dashboard/${workspaceId}` }
  const currentPagePath = `/dashboard/${workspaceId}`
  const isDesktop = useIsDesktopLayout()
  const pendingActiveWorkspaceRequestRef = useRef<string | null>(null)
  const workspace = workspaceQuery.data
  const loadedWorkspaceId = workspace?.id

  useEffect(() => {
    const activeWorkspaceId = activeWorkspaceIdQuery.data

    if (!loadedWorkspaceId) {
      return
    }

    if (!activeWorkspaceId) {
      return
    }

    if (activeWorkspaceId === workspaceId) {
      pendingActiveWorkspaceRequestRef.current = null
      return
    }

    if (pendingActiveWorkspaceRequestRef.current === workspaceId) {
      return
    }

    pendingActiveWorkspaceRequestRef.current = workspaceId
    setActiveWorkspaceId(workspaceId, {
      onError: () => {
        if (pendingActiveWorkspaceRequestRef.current === workspaceId) {
          pendingActiveWorkspaceRequestRef.current = null
        }
      },
    })
  }, [activeWorkspaceIdQuery.data, loadedWorkspaceId, setActiveWorkspaceId, workspaceId])

  const isInitialLoading =
    workspaceQuery.isLoading ||
    (foldersQuery.isLoading && foldersQuery.data === undefined) ||
    (decksQuery.isLoading && decksQuery.data === undefined)
  const showInitialLoading = useDelayedBoolean(isInitialLoading, 180)
  const isSearchLoading = searchQuery.isLoading && searchQuery.data === undefined
  const showSearchLoading = useDelayedBoolean(isSearchLoading, 120)
  const foldersUnavailable = foldersQuery.isError && foldersQuery.data === undefined
  const decksUnavailable = decksQuery.isError && decksQuery.data === undefined
  const folders = foldersQuery.data ?? []
  const decks = decksQuery.data ?? []
  const isWorkspaceEmpty =
    trimmedQuery.length === 0 &&
    foldersQuery.data !== undefined &&
    decksQuery.data !== undefined &&
    !foldersUnavailable &&
    !decksUnavailable &&
    folders.length === 0 &&
    decks.length === 0
  const openCreateDeck = () => {
    void navigate({
      params: { entityKind: 'deck', workspaceId },
      state: createOpenedFromState(currentPagePath),
      to: '/dashboard/$workspaceId/create/$entityKind',
    })
  }
  const openCreateFolder = () => {
    void navigate({
      params: { entityKind: 'folder', workspaceId },
      state: createOpenedFromState(currentPagePath),
      to: '/dashboard/$workspaceId/create/$entityKind',
    })
  }
  const openDeleteWorkspaceDialog = (workspace: Workspace) => {
    deleteWorkspace.reset()
    setPendingWorkspace(workspace)
  }
  const closeDeleteWorkspaceDialog = () => {
    setPendingWorkspace(null)
    deleteWorkspace.reset()
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
  const confirmDeleteWorkspace = () => {
    if (pendingWorkspace) {
      deleteWorkspace.mutate(pendingWorkspace.id, {
        onSuccess: () => {
          setPendingWorkspace(null)
          void navigate({ to: '/workspaces' })
        },
      })
    }
  }
  const confirmDeleteFolder = () => {
    if (pendingFolder) {
      deleteFolder.mutate(pendingFolder.id, {
        onSuccess: () => {
          setPendingFolder(null)
        },
      })
    }
  }
  const confirmDeleteDeck = () => {
    if (pendingDeck) {
      deleteDeck.mutate(pendingDeck.id, {
        onSuccess: () => {
          setPendingDeck(null)
        },
      })
    }
  }
  const workspaceActionMenu = workspace ? (
    <ActionMenu
      dialogLabel={`${workspace.title} actions`}
      items={[
        {
          icon: <Pencil className="size-4 stroke-[2.4]" />,
          label: t(($) => $.common.actions.edit),
          onSelect: () => {
            void navigate({
              params: { workspaceId: workspace.id },
              state: createOpenedFromState(currentPagePath),
              to: '/workspaces/$workspaceId/edit',
            })
          },
        },
        {
          icon: <Trash2 className="size-4 stroke-[2.2]" />,
          label: t(($) => $.common.actions.delete),
          onSelect: () => openDeleteWorkspaceDialog(workspace),
          tone: 'danger',
        },
      ]}
      triggerAriaLabel={`${workspace.title} actions`}
      triggerClassName="text-foreground hover:bg-muted"
    />
  ) : null

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
  const searchResults = (
    <SearchResults
      key={debouncedQuery}
      emptyDescription={t(($) => $.search.empty.noMatchesInWorkspaceDescription, {
        query: trimmedQuery,
      })}
      emptyTitle={t(($) => $.search.empty.noMatchesInWorkspace)}
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
  const showFolderSection = foldersUnavailable || folders.length > 0
  const showDeckSection = decksUnavailable || decks.length > 0
  const emptyWorkspaceState = (
    <EmptyState
      actions={[
        {
          icon: <Layers3 className="size-4" />,
          label: t(($) => $.dashboard.actions.newDeck),
          onClick: openCreateDeck,
        },
        {
          icon: <FolderPlus className="size-4" />,
          label: t(($) => $.dashboard.actions.newFolder),
          onClick: openCreateFolder,
          variant: 'outline',
        },
      ]}
      description={t(($) => $.dashboard.descriptions.emptyWorkspace)}
      icon={<Layers3 className="size-6" />}
      title={t(($) => $.dashboard.empty.createFirstDeck)}
    />
  )
  const folderSection: ReactNode = foldersUnavailable ? (
    <LoadErrorState
      error={foldersQuery.error}
      title={t(($) => $.dashboard.errors.foldersCouldNotLoad)}
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
  const decksSection: ReactNode = decksUnavailable ? (
    <LoadErrorState
      error={decksQuery.error}
      title={t(($) => $.dashboard.errors.decksCouldNotLoad)}
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
  const viewProps: DashboardPageViewProps = isInitialLoading
    ? {
        homeTarget,
        showSkeleton: showInitialLoading,
        state: 'loading',
      }
    : workspaceQuery.isError && !workspace
      ? {
          error: workspaceQuery.error,
          homeTarget,
          onRetry: () => {
            void workspaceQuery.refetch()
          },
          state: 'workspace-error',
        }
      : {
          currentPagePath,
          decksSection,
          description: workspace?.description ?? t(($) => $.dashboard.descriptions.defaultWorkspace),
          emptyState: isWorkspaceEmpty ? emptyWorkspaceState : null,
          folderSection,
          homeTarget,
          query,
          searchActive: trimmedQuery.length > 0,
          searchResults,
          screenClassName: bottomStatusScreenClassName,
          showDeckSection,
          showFolderSection,
          state: 'loaded',
          title: workspace?.title ?? t(($) => $.dashboard.labels.dashboard),
          workspaceActionMenu,
          workspaceId,
          onCreateDeck: openCreateDeck,
          onCreateFolder: openCreateFolder,
          onQueryChange: handleQueryChange,
        }

  return (
    <>
      <DashboardPageView isDesktop={isDesktop} view={viewProps} />
      <DashboardDeleteDialogs
        deckActionError={
          deleteDeck.isError
            ? { error: deleteDeck.error, title: t(($) => $.dashboard.errors.couldNotDeleteDeck) }
            : null
        }
        deletingDeck={deleteDeck.isPending}
        deletingFolder={deleteFolder.isPending}
        deletingWorkspace={deleteWorkspace.isPending}
        folderActionError={
          deleteFolder.isError
            ? { error: deleteFolder.error, title: t(($) => $.dashboard.errors.couldNotDeleteFolder) }
            : null
        }
        pendingDeck={pendingDeck}
        pendingFolder={pendingFolder}
        pendingWorkspace={pendingWorkspace}
        workspaceActionError={
          deleteWorkspace.isError
            ? { error: deleteWorkspace.error, title: t(($) => $.dashboard.errors.couldNotDeleteWorkspace) }
            : null
        }
        onCloseDeck={closeDeleteDeckDialog}
        onCloseFolder={closeDeleteFolderDialog}
        onCloseWorkspace={closeDeleteWorkspaceDialog}
        onConfirmDeck={confirmDeleteDeck}
        onConfirmFolder={confirmDeleteFolder}
        onConfirmWorkspace={confirmDeleteWorkspace}
      />
      {hasBottomStatus ? (
        <BottomStatusStack className={isDesktop ? desktopBottomStatusStackClassName : undefined}>
          {hasFolderRefreshError ? (
            <BottomStatus
              actionLabel={t(($) => $.common.actions.checkAgain)}
              dismissKey={foldersQuery.errorUpdateCount}
              error={foldersQuery.error}
              title={t(($) => $.dashboard.errors.foldersMayBeOutOfDate)}
              onAction={() => {
                void foldersQuery.refetch()
              }}
            />
          ) : null}
          {hasDeckRefreshError ? (
            <BottomStatus
              actionLabel={t(($) => $.common.actions.checkAgain)}
              dismissKey={decksQuery.errorUpdateCount}
              error={decksQuery.error}
              title={t(($) => $.dashboard.errors.decksMayBeOutOfDate)}
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
