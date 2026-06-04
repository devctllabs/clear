import { useState, type ChangeEventHandler } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { FileText, Pencil, Trash2 } from 'lucide-react'

import {
  SearchResults,
  useContentSearch,
  useDebouncedValue,
} from '@features/content-search'
import { useDeleteNote, useNotesByDeck } from '@features/notes/hooks/useNotes'
import { NoteList } from '@features/notes/components/NoteList'
import { noteCreateOptions } from '@features/notes/components/noteCreateOptions'
import type { NoteKind, NoteListItem } from '@features/notes'
import { ActionMenu } from '@shared/components/feedback/ActionMenu'
import { EmptyState } from '@shared/components/feedback/EmptyState'
import {
  BottomStatus,
  BottomStatusStack,
  bottomStatusContentPaddingClassName,
  desktopBottomStatusStackClassName,
} from '@shared/components/feedback/BottomActionErrorStatus'
import { LoadErrorState } from '@shared/components/feedback/LoadErrorState'
import { usePersistedSort } from '@shared/components/data/SortMenu'
import { createOpenedFromState, useCloseTarget } from '@shared/lib/navigation-state'
import { useDelayedBoolean } from '@shared/hooks/useDelayedBoolean'
import { useIsDesktopLayout } from '@shared/hooks/useAppLayoutMode'

import { DeckDeleteDialogs } from '../components/DeckDeleteDialogs'
import {
  DeckDetailPageView,
  type DeckDetailPageViewProps,
} from '../components/DeckDetailPageView'
import { useDeck, useDeleteDeck } from '../hooks/useDecks'
import type { DeckDetail } from '../types/deck.types'

export const DeckDetailPage = ({
  deckId,
  workspaceId,
}: {
  deckId: string
  workspaceId: string
}) => {
  const navigate = useNavigate()
  const [noteSort, setNoteSort] = usePersistedSort('workspace-sort:deck-notes')
  const deckQuery = useDeck(deckId)
  const notesQuery = useNotesByDeck(deckId, noteSort)
  const deleteDeck = useDeleteDeck()
  const deleteNote = useDeleteNote()
  const [query, setQuery] = useState('')
  const [pendingDeck, setPendingDeck] = useState<DeckDetail | null>(null)
  const [pendingNote, setPendingNote] = useState<NoteListItem | null>(null)
  const debouncedQuery = useDebouncedValue(query, 250)
  const trimmedQuery = debouncedQuery.trim()
  const searchQuery = useContentSearch({ deckId, kind: 'deck' }, debouncedQuery)
  const studyNowTo = `/dashboard/${workspaceId}/decks/${deckId}/review`
  const homeTarget = { to: `/dashboard/${workspaceId}/decks/${deckId}` }
  const currentPagePath = `/dashboard/${workspaceId}/decks/${deckId}`
  const isDesktop = useIsDesktopLayout()
  const deckParentId = deckQuery.data?.parentId
  const hierarchyBackTo =
    deckParentId && deckParentId !== workspaceId
      ? `/dashboard/${workspaceId}/folders/${deckParentId}`
      : `/dashboard/${workspaceId}`
  const backTo = useCloseTarget(hierarchyBackTo)

  const isInitialLoading =
    deckQuery.isLoading || (notesQuery.isLoading && notesQuery.data === undefined)
  const showInitialLoading = useDelayedBoolean(isInitialLoading, 180)
  const isSearchLoading = searchQuery.isLoading && searchQuery.data === undefined
  const showSearchLoading = useDelayedBoolean(isSearchLoading, 120)
  const notesUnavailable = notesQuery.isError && notesQuery.data === undefined
  const openCreateNote = (kind: NoteKind) => {
    void navigate({
      params: { deckId, kind, workspaceId },
      state: createOpenedFromState(currentPagePath),
      to: '/dashboard/$workspaceId/decks/$deckId/notes/new/$kind',
    })
  }
  const openDeleteDeckDialog = (deck: DeckDetail) => {
    deleteDeck.reset()
    setPendingDeck(deck)
  }
  const closeDeleteDeckDialog = () => {
    setPendingDeck(null)
    deleteDeck.reset()
  }
  const openDeleteNoteDialog = (note: NoteListItem) => {
    deleteNote.reset()
    setPendingNote(note)
  }
  const closeDeleteNoteDialog = () => {
    setPendingNote(null)
    deleteNote.reset()
  }
  const confirmDeleteDeck = () => {
    if (pendingDeck) {
      deleteDeck.mutate(pendingDeck.id, {
        onSuccess: () => {
          setPendingDeck(null)
          void navigate({ to: backTo as never })
        },
      })
    }
  }
  const confirmDeleteNote = () => {
    if (pendingNote) {
      deleteNote.mutate(pendingNote.id, {
        onSuccess: () => {
          setPendingNote(null)
        },
      })
    }
  }
  const handleQueryChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setQuery(event.target.value)
  }
  const clearSearch = () => {
    setQuery('')
  }

  const deck = deckQuery.data
  const notes = notesQuery.data ?? []
  const deckActionMenu = deck ? (
    <ActionMenu
      dialogLabel={`${deck.title} actions`}
      items={[
        {
          icon: <Pencil className="size-4 stroke-[2.4]" />,
          label: 'Edit',
          onSelect: () => {
            void navigate({
              params: { deckId: deck.id, workspaceId },
              state: createOpenedFromState(currentPagePath),
              to: '/dashboard/$workspaceId/decks/$deckId/edit',
            })
          },
        },
        {
          icon: <Trash2 className="size-4 stroke-[2.2]" />,
          label: 'Delete',
          onSelect: () => openDeleteDeckDialog(deck),
          tone: 'danger',
        },
      ]}
      triggerAriaLabel={`${deck.title} actions`}
      triggerClassName="text-foreground hover:bg-muted"
    />
  ) : null
  const hasNotesRefreshError = notesQuery.isError && notesQuery.data !== undefined
  const emptyNotesState = (
    <div className={isDesktop ? 'flex h-full min-h-0 flex-col' : undefined}>
      <EmptyState
        actions={noteCreateOptions.map(({ Icon, kind, label }, index) => ({
          icon: <Icon className="size-4" />,
          label,
          onClick: () => openCreateNote(kind),
          variant: index === 0 ? undefined : 'outline',
        }))}
        className={isDesktop ? 'min-h-0 flex-1' : undefined}
        density={isDesktop ? 'compact' : 'default'}
        description="Add a note so this deck has material to review."
        fill={isDesktop}
        icon={<FileText className="size-6" />}
        title="This deck is empty"
      />
    </div>
  )
  const notesEmpty =
    trimmedQuery.length === 0 &&
    !notesUnavailable &&
    notesQuery.data !== undefined &&
    notes.length === 0
  const notesContent = trimmedQuery ? (
    <SearchResults
      key={debouncedQuery}
      emptyDescription={`No notes matched "${trimmedQuery}".`}
      emptyTitle="No matching notes"
      error={searchQuery.error}
      groups={searchQuery.data}
      loading={showSearchLoading}
      query={debouncedQuery}
      onClearSearch={clearSearch}
      onRetry={() => {
        void searchQuery.refetch()
      }}
    />
  ) : notesUnavailable ? (
    <LoadErrorState
      className="mt-6"
      error={notesQuery.error}
      title="Notes could not be loaded"
      onRetry={() => {
        void notesQuery.refetch()
      }}
    />
  ) : notesEmpty ? (
    emptyNotesState
  ) : (
    <NoteList
      deckId={deckId}
      notes={notes}
      openedFrom={currentPagePath}
      sort={noteSort}
      workspaceId={workspaceId}
      onDelete={openDeleteNoteDialog}
      onSortChange={setNoteSort}
    />
  )
  const viewProps: DeckDetailPageViewProps = isInitialLoading
    ? {
        backTo,
        homeTarget,
        showSkeleton: showInitialLoading,
        state: 'loading',
      }
    : deckQuery.isError && !deck
      ? {
          backTo: hierarchyBackTo,
          error: deckQuery.error,
          homeTarget,
          onRetry: () => {
            void deckQuery.refetch()
          },
          state: 'deck-error',
        }
      : {
          backTo,
          currentPagePath,
          deck,
          deckActionMenu,
          deckId,
          homeTarget,
          notesContent,
          notesEmpty,
          query,
          searchActive: trimmedQuery.length > 0,
          screenClassName: hasNotesRefreshError
            ? bottomStatusContentPaddingClassName
            : undefined,
          state: 'loaded',
          studyNowTo,
          workspaceId,
          onCreateNote: openCreateNote,
          onQueryChange: handleQueryChange,
        }

  return (
    <>
      <DeckDetailPageView isDesktop={isDesktop} view={viewProps} />
      <DeckDeleteDialogs
        deckActionError={
          deleteDeck.isError
            ? { error: deleteDeck.error, title: 'Could not delete deck' }
            : null
        }
        deletingDeck={deleteDeck.isPending}
        deletingNote={deleteNote.isPending}
        noteActionError={
          deleteNote.isError
            ? { error: deleteNote.error, title: 'Could not delete note' }
            : null
        }
        pendingDeck={pendingDeck}
        pendingNote={pendingNote}
        onCloseDeck={closeDeleteDeckDialog}
        onCloseNote={closeDeleteNoteDialog}
        onConfirmDeck={confirmDeleteDeck}
        onConfirmNote={confirmDeleteNote}
      />
      {hasNotesRefreshError ? (
        <BottomStatusStack className={isDesktop ? desktopBottomStatusStackClassName : undefined}>
          <BottomStatus
            actionLabel="Check again"
            dismissKey={notesQuery.errorUpdateCount}
            error={notesQuery.error}
            title="Notes may be out of date"
            onAction={() => {
              void notesQuery.refetch()
            }}
          />
        </BottomStatusStack>
      ) : null}
    </>
  )
}
