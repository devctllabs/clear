import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import type { TFunction } from 'i18next'
import { useController, useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import {
  fieldErrorMessages,
  mergeFieldValidationMessages,
  requiredFieldMessage,
} from '@shared/components/forms/validation'
import { EditorErrorState } from '@shared/components/layout/EditorErrorState'
import { EditorShell } from '@shared/components/layout/EditorShell'
import { useDeck } from '@features/decks/hooks/useDecks'
import { translateValidationIssuesForPath } from '@shared/errors/translation'
import { useCloseTarget } from '@shared/lib/navigation-state'

import { NoteEditorLoadingState } from '../components/NoteEditorLoadingState'
import { NoteEditorForm, type NoteEditorValidationMessages } from '../components/NoteEditorForm'
import { useCreateNote, useNote, useUpdateNote } from '../hooks/useNotes'
import type { NoteKind } from '../types/note.types'

const createNoteEditorSchema = (t: TFunction) =>
  z
    .object({
      activeKind: z.enum(['basic', 'cloze']),
      basicBack: z.string(),
      basicFront: z.string(),
      clozeBody: z.string(),
      title: z.string(),
    })
    .superRefine((value, context) => {
      if (value.activeKind === 'basic') {
        if (value.basicFront.trim().length === 0) {
          context.addIssue({
            code: 'custom',
            message: requiredFieldMessage(t, t(($) => $.notes.fields.front)),
            path: ['basicFront'],
          })
        }

        if (value.basicBack.trim().length === 0) {
          context.addIssue({
            code: 'custom',
            message: requiredFieldMessage(t, t(($) => $.notes.fields.back)),
            path: ['basicBack'],
          })
        }

        return
      }

      if (value.clozeBody.trim().length === 0) {
        context.addIssue({
          code: 'custom',
          message: requiredFieldMessage(t, t(($) => $.notes.fields.noteBody)),
          path: ['clozeBody'],
        })
      }
    })

type NoteEditorFormValues = z.infer<ReturnType<typeof createNoteEditorSchema>>

const noteEditorDefaultValues = (kind: NoteKind): NoteEditorFormValues => ({
  activeKind: kind,
  basicBack: '',
  basicFront: '',
  clozeBody: '',
  title: '',
})

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
  const { t } = useTranslation()
  const navigate = useNavigate()
  const deckQuery = useDeck(deckId)
  const noteQuery = useNote(deckId, noteId ?? '')
  const createNote = useCreateNote()
  const updateNote = useUpdateNote(noteId ?? '')
  const form = useForm<NoteEditorFormValues>({
    defaultValues: noteEditorDefaultValues(kind),
    resolver: zodResolver(createNoteEditorSchema(t), undefined, { mode: 'sync' }),
  })
  const title = useController({ control: form.control, name: 'title' })
  const basicFront = useController({ control: form.control, name: 'basicFront' })
  const basicBack = useController({ control: form.control, name: 'basicBack' })
  const clozeBody = useController({ control: form.control, name: 'clozeBody' })
  const activeKind = useWatch({ control: form.control, name: 'activeKind' })
  const fallbackTo =
    mode === 'edit' && noteId
      ? `/dashboard/${workspaceId}/decks/${deckId}/notes/${noteId}`
      : `/dashboard/${workspaceId}/decks/${deckId}`
  const backTo = useCloseTarget(fallbackTo)
  const isSubmitting = mode === 'edit' ? updateNote.isPending : createNote.isPending
  const editorTitle =
    mode === 'edit'
      ? t(($) => $.notes.actions.editNote)
      : t(($) => $.notes.labels.newNote)

  useEffect(() => {
    if (mode !== 'edit' || !noteQuery.data) {
      return
    }

    if (noteQuery.data.kind === 'basic') {
      form.reset({
        activeKind: noteQuery.data.kind,
        basicBack: noteQuery.data.editor.back,
        basicFront: noteQuery.data.editor.front,
        clozeBody: '',
        title: noteQuery.data.title,
      })
      return
    }

    form.reset({
      activeKind: noteQuery.data.kind,
      basicBack: '',
      basicFront: '',
      clozeBody: noteQuery.data.editor.body,
      title: noteQuery.data.title,
    })
  }, [form, mode, noteQuery.data])

  if (deckQuery.isLoading || (mode === 'edit' && noteQuery.isLoading)) {
    return (
      <NoteEditorLoadingState
        activeKind={activeKind}
        backTo={backTo}
        title={editorTitle}
      />
    )
  }

  if (deckQuery.isError && !deckQuery.data) {
    return (
      <EditorErrorState
        backTo={backTo}
        error={deckQuery.error}
        errorTitle={t(($) => $.decks.errors.deckCouldNotLoad)}
        title={editorTitle}
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
        errorTitle={t(($) => $.notes.errors.noteCouldNotLoad)}
        title={t(($) => $.notes.actions.editNote)}
        onRetry={() => {
          void noteQuery.refetch()
        }}
      />
    )
  }

  const submit = form.handleSubmit((values) => {
    const trimmedTitle = values.title.trim()
    const trimmedBasicDraft = {
      back: values.basicBack.trim(),
      front: values.basicFront.trim(),
    }
    const trimmedClozeDraft = {
      body: values.clozeBody.trim(),
    }
    const draft =
      values.activeKind === 'basic'
        ? {
            deckId,
            editor: trimmedBasicDraft,
            kind: 'basic' as const,
            title: trimmedTitle || trimmedBasicDraft.front || t(($) => $.notes.fields.untitledNote),
          }
        : {
            deckId,
            editor: trimmedClozeDraft,
            kind: 'cloze' as const,
            title: trimmedTitle || t(($) => $.notes.fields.untitledCloze),
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
  })

  const switchKind = (nextKind: NoteKind) => {
    const currentKind = form.getValues('activeKind')

    if (nextKind === currentKind) {
      return
    }

    resetMutationError()
    form.clearErrors()

    if (nextKind === 'basic') {
      const currentFront = form.getValues('basicFront')
      const currentBody = form.getValues('clozeBody')

      if (currentFront.trim().length === 0 && currentBody.trim().length > 0) {
        form.setValue('basicFront', currentBody, { shouldDirty: true })
      }

      form.setValue('activeKind', nextKind, { shouldDirty: true })
      return
    }

    const currentBody = form.getValues('clozeBody')
    const currentFront = form.getValues('basicFront')

    if (currentBody.trim().length === 0 && currentFront.trim().length > 0) {
      form.setValue('clozeBody', currentFront, { shouldDirty: true })
    }

    form.setValue('activeKind', nextKind, { shouldDirty: true })
  }

  const resetMutationError = () => {
    if (mode === 'edit' && updateNote.isError) {
      updateNote.reset()
    }

    if (mode === 'create' && createNote.isError) {
      createNote.reset()
    }
  }

  const handleTitleChange = (nextTitle: string) => {
    resetMutationError()
    title.field.onChange(nextTitle)
  }

  const handleFrontChange = (front: string) => {
    resetMutationError()
    if (front.trim().length > 0) {
      form.clearErrors('basicFront')
    }
    basicFront.field.onChange(front)
  }

  const handleBackChange = (back: string) => {
    resetMutationError()
    if (back.trim().length > 0) {
      form.clearErrors('basicBack')
    }
    basicBack.field.onChange(back)
  }

  const handleBodyChange = (body: string) => {
    resetMutationError()
    if (body.trim().length > 0) {
      form.clearErrors('clozeBody')
    }
    clozeBody.field.onChange(body)
  }

  const actionError =
    mode === 'edit' && updateNote.isError
      ? { error: updateNote.error, title: t(($) => $.notes.errors.couldNotSaveNote) }
      : mode === 'create' && createNote.isError
        ? { error: createNote.error, title: t(($) => $.notes.errors.couldNotCreateNote) }
        : null
  const validationError =
    mode === 'edit' && updateNote.isError
      ? updateNote.error
      : mode === 'create' && createNote.isError
        ? createNote.error
        : null
  const serviceValidationMessages = validationError
    ? {
        basicBack: translateValidationIssuesForPath(
          t,
          validationError,
          ['editor', 'back'],
          t(($) => $.notes.fields.back),
        ),
        basicFront: translateValidationIssuesForPath(
          t,
          validationError,
          ['editor', 'front'],
          t(($) => $.notes.fields.front),
        ),
        clozeBody: translateValidationIssuesForPath(
          t,
          validationError,
          ['editor', 'body'],
          t(($) => $.notes.fields.noteBody),
        ),
        title: translateValidationIssuesForPath(
          t,
          validationError,
          ['title'],
          t(($) => $.notes.fields.title),
        ),
      }
    : undefined
  const formValidationMessages: NoteEditorValidationMessages = {
    basicBack: fieldErrorMessages(form.formState.errors.basicBack),
    basicFront: fieldErrorMessages(form.formState.errors.basicFront),
    clozeBody: fieldErrorMessages(form.formState.errors.clozeBody),
    title: fieldErrorMessages(form.formState.errors.title),
  }
  const validationMessages = mergeFieldValidationMessages(
    serviceValidationMessages,
    formValidationMessages,
  )
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
      actionLabel={t(($) => $.notes.actions.saveNote)}
      actionError={actionError}
      backTo={backTo}
      isSubmitting={isSubmitting}
      mobileContentBottomPaddingClassName={contentBottomPadding}
      title={editorTitle}
      onSubmit={submit}
    >
      <NoteEditorForm
        activeKind={activeKind}
        basicDraft={{
          back: basicBack.field.value,
          front: basicFront.field.value,
        }}
        clozeDraft={{ body: clozeBody.field.value }}
        title={title.field.value}
        validationMessages={validationMessages}
        onBackChange={handleBackChange}
        onBodyChange={handleBodyChange}
        onFrontChange={handleFrontChange}
        onKindChange={switchKind}
        onTitleChange={handleTitleChange}
      />
    </EditorShell>
  )
}
