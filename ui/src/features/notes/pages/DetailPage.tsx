import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Pencil, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useDeck } from '@features/decks/hooks/useDecks'
import { ActionMenu } from '@shared/components/feedback/ActionMenu'
import { createOpenedFromState } from '@shared/lib/navigation-state'
import { useDelayedBoolean } from '@shared/hooks/useDelayedBoolean'
import { useIsDesktopLayout } from '@shared/hooks/useAppLayoutMode'

import { NoteDeleteDialog } from '../components/NoteDeleteDialog'
import {
  NoteDetailPageView,
  type NoteDetailPageViewProps,
} from '../components/NoteDetailPageView'
import { useDeleteNote, useNote } from '../hooks/useNotes'

export const NoteDetailPage = ({
  deckId,
  noteId,
  workspaceId,
}: {
  deckId: string
  noteId: string
  workspaceId: string
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const deckQuery = useDeck(deckId)
  const noteQuery = useNote(deckId, noteId)
  const deleteNote = useDeleteNote()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const homeTarget = { to: `/dashboard/${workspaceId}/decks/${deckId}/notes/${noteId}` }
  const isDesktop = useIsDesktopLayout()
  const isInitialLoading = noteQuery.isLoading
  const showInitialLoading = useDelayedBoolean(isInitialLoading, 180)
  const backTo = `/dashboard/${workspaceId}/decks/${deckId}`
  const openedFrom = `/dashboard/${workspaceId}/decks/${deckId}/notes/${noteId}`
  const openDeleteDialog = () => {
    deleteNote.reset()
    setIsDeleteDialogOpen(true)
  }
  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false)
    deleteNote.reset()
  }

  const note = noteQuery.data
  const confirmDeleteNote = () => {
    if (note) {
      deleteNote.mutate(note.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false)
          void navigate({ to: backTo as never })
        },
      })
    }
  }
  const editNote = () => {
    if (!note) {
      return
    }

    void navigate({
      params: { deckId, noteId: note.id, workspaceId },
      state: createOpenedFromState(openedFrom),
      to: '/dashboard/$workspaceId/decks/$deckId/notes/$noteId/edit',
    })
  }
  const noteActionMenu = note ? (
    <ActionMenu
      dialogLabel={t(($) => $.common.actions.itemActions, { title: note.title })}
      items={[
        {
          icon: <Pencil className="size-4 stroke-[2.4]" />,
          label: t(($) => $.common.actions.edit),
          onSelect: editNote,
        },
        {
          icon: <Trash2 className="size-4 stroke-[2.2]" />,
          label: t(($) => $.common.actions.delete),
          onSelect: openDeleteDialog,
          tone: 'danger',
        },
      ]}
      triggerAriaLabel={t(($) => $.common.actions.itemActions, { title: note.title })}
      triggerClassName="text-foreground hover:bg-muted"
    />
  ) : null
  const viewProps: NoteDetailPageViewProps = isInitialLoading
    ? {
        backTo,
        homeTarget,
        showSkeleton: showInitialLoading,
        state: 'loading',
      }
    : noteQuery.isError && !note
      ? {
          backTo,
          error: noteQuery.error,
          homeTarget,
          onRetry: () => {
            void noteQuery.refetch()
          },
          state: 'note-error',
        }
      : {
          backTo,
          deckId,
          deckTitle: deckQuery.data?.title,
          homeTarget,
          note,
          noteActionMenu,
          noteId,
          openedFrom,
          state: 'loaded',
          workspaceId,
          onDelete: openDeleteDialog,
          onEdit: editNote,
        }

  return (
    <>
      <NoteDetailPageView isDesktop={isDesktop} view={viewProps} />
      <NoteDeleteDialog
        actionError={
          deleteNote.isError
            ? { error: deleteNote.error, title: t(($) => $.notes.errors.couldNotDeleteNote) }
            : null
        }
        confirming={deleteNote.isPending}
        note={note}
        open={isDeleteDialogOpen}
        onConfirm={confirmDeleteNote}
        onOpenChange={(open) => {
          if (!open) {
            closeDeleteDialog()
            return
          }

          setIsDeleteDialogOpen(true)
        }}
      />
    </>
  )
}
