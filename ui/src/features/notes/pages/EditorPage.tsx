import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { EditorErrorState } from '@shared/components/layout/EditorErrorState'
import { EditorShell } from '@shared/components/layout/EditorShell'
import { useDeck } from '@features/decks/hooks/useDecks'
import { useCloseTarget } from '@shared/lib/navigation-state'

import { NoteEditorLoadingState } from '../components/NoteEditorLoadingState'
import { NoteEditorForm } from '../components/NoteEditorForm'
import { useCreateNote, useNote, useUpdateNote } from '../hooks/useNotes'
import type { BasicNoteEditor, ClozeNoteEditor, NoteKind } from '../types/note.types'

export const NoteEditorPage = ({
  deckId,
  kind,
  mode,
  noteId,
  workspaceId,
}: {
  deckId: string
  kind: NoteKind
  mode: 'create' | 'edit'
  noteId?: string
  workspaceId: string
}) => {
  const navigate = useNavigate()
  const deckQuery = useDeck(deckId)
  const noteQuery = useNote(deckId, noteId ?? '')
  const createNote = useCreateNote()
  const updateNote = useUpdateNote(noteId ?? '')
  const [title, setTitle] = useState('')
  const [activeKind, setActiveKind] = useState<NoteKind>(kind)
  const [basicDraft, setBasicDraft] = useState<BasicNoteEditor>({ back: '', front: '' })
  const [clozeDraft, setClozeDraft] = useState<ClozeNoteEditor>({ body: '' })
  const fallbackTo =
    mode === 'edit' && noteId
      ? `/dashboard/${workspaceId}/decks/${deckId}/notes/${noteId}`
      : `/dashboard/${workspaceId}/decks/${deckId}`
  const backTo = useCloseTarget(fallbackTo)
  const isSubmitting = mode === 'edit' ? updateNote.isPending : createNote.isPending

  useEffect(() => {
    if (mode !== 'edit' || !noteQuery.data) {
      return
    }

    setTitle(noteQuery.data.title)
    setActiveKind(noteQuery.data.kind)
    if (noteQuery.data.kind === 'basic') {
      setBasicDraft(noteQuery.data.editor)
    } else {
      setClozeDraft(noteQuery.data.editor)
    }
  }, [mode, noteQuery.data])

  if (deckQuery.isLoading || (mode === 'edit' && noteQuery.isLoading)) {
    return (
      <NoteEditorLoadingState
        activeKind={activeKind}
        backTo={backTo}
        title={mode === 'edit' ? 'Edit Note' : 'New Note'}
      />
    )
  }

  if (deckQuery.isError && !deckQuery.data) {
    return (
      <EditorErrorState
        backTo={backTo}
        error={deckQuery.error}
        title={mode === 'edit' ? 'Edit Note' : 'New Note'}
        onRetry={() => {
          void deckQuery.refetch()
        }}
      />
    )
  }

  if (mode === 'edit' && noteQuery.isError && !noteQuery.data) {
    return (
      <EditorErrorState
        backTo={backTo}
        error={noteQuery.error}
        title="Edit Note"
        onRetry={() => {
          void noteQuery.refetch()
        }}
      />
    )
  }

  const submit = () => {
    const draft =
      activeKind === 'basic'
        ? {
            deckId,
            editor: basicDraft,
            kind: 'basic' as const,
            title: title.trim() || basicDraft.front.trim() || 'Untitled Note',
          }
        : {
            deckId,
            editor: clozeDraft,
            kind: 'cloze' as const,
            title: title.trim() || 'Untitled Cloze',
          }

    if (mode === 'edit' && noteId) {
      updateNote.mutate(draft, {
        onSuccess: (note) => {
          void navigate({
            params: { deckId: note.deckId, noteId: note.id, workspaceId },
            to: '/dashboard/$workspaceId/decks/$deckId/notes/$noteId',
          })
        },
      })
      return
    }

    createNote.mutate(draft, {
      onSuccess: (note) => {
        void navigate({
          params: { deckId: note.deckId, noteId: note.id, workspaceId },
          to: '/dashboard/$workspaceId/decks/$deckId/notes/$noteId',
        })
      },
    })
  }

  const switchKind = (nextKind: NoteKind) => {
    if (nextKind === activeKind) {
      return
    }

    if (nextKind === 'basic') {
      setBasicDraft((current) =>
        current.front.trim().length > 0
          ? current
          : {
              ...current,
              front: clozeDraft.body.trim().length > 0 ? clozeDraft.body : current.front,
            },
      )
    } else {
      setClozeDraft((current) =>
        current.body.trim().length > 0
          ? current
          : {
              ...current,
              body: basicDraft.front.trim().length > 0 ? basicDraft.front : current.body,
            },
      )
    }

    setActiveKind(nextKind)
  }

  const actionError =
    mode === 'edit' && updateNote.isError
      ? { error: updateNote.error, title: 'Could not save note' }
      : mode === 'create' && createNote.isError
        ? { error: createNote.error, title: 'Could not create note' }
        : null
  const contentBottomPadding =
    activeKind === 'cloze'
      ? actionError
        ? 'pb-60'
        : 'pb-48'
      : actionError
        ? 'pb-44'
        : 'pb-32'

  return (
    <EditorShell
      actionLabel="Save note"
      actionError={actionError}
      backTo={backTo}
      isSubmitting={isSubmitting}
      mobileContentBottomPaddingClassName={contentBottomPadding}
      title={mode === 'edit' ? 'Edit Note' : 'New Note'}
      onSubmit={submit}
    >
      <NoteEditorForm
        activeKind={activeKind}
        basicDraft={basicDraft}
        clozeDraft={clozeDraft}
        title={title}
        onBackChange={(back) => setBasicDraft((draft) => ({ ...draft, back }))}
        onBodyChange={(body) => setClozeDraft({ body })}
        onFrontChange={(front) => setBasicDraft((draft) => ({ ...draft, front }))}
        onKindChange={switchKind}
        onTitleChange={setTitle}
      />
    </EditorShell>
  )
}
