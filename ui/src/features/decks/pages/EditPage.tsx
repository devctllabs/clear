import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import type { TFunction } from 'i18next'
import { useController, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import {
  isVisualIconName,
  type VisualIconName,
} from '@shared/components/icons/IconGlyph'
import { useFolderPath } from '@features/folders/hooks/useFolders'
import { InlineErrorState } from '@shared/components/feedback/LoadErrorState'
import {
  fieldErrorMessages,
  mergeFieldValidationMessages,
  requiredFieldMessage,
  requiredTrimmedText,
} from '@shared/components/forms/validation'
import { EditorErrorState } from '@shared/components/layout/EditorErrorState'
import { EditorShell } from '@shared/components/layout/EditorShell'
import { EditorLoadingState } from '@shared/components/layout/EditorLoadingState'
import { translateValidationIssuesForPath } from '@shared/errors/translation'
import { useCloseTarget } from '@shared/lib/navigation-state'

import { DeckEditorForm, type DeckEditorValidationMessages } from '../components/DeckEditorForm'
import { defaultDeckVisualIcon } from '../constants/visuals'
import { useDeck, useUpdateDeck } from '../hooks/useDecks'

const createDeckEditorSchema = (t: TFunction) =>
  z.object({
    description: z.string(),
    icon: z.custom<VisualIconName>(isVisualIconName, {
      message: requiredFieldMessage(t, t(($) => $.common.labels.visual)),
    }),
    title: requiredTrimmedText(t, t(($) => $.common.labels.name)),
  })

type DeckEditorFormValues = z.infer<ReturnType<typeof createDeckEditorSchema>>

export const DeckEditPage = ({
  deckId,
  workspaceId,
}: {
  deckId: string
  workspaceId: string
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const deckQuery = useDeck(deckId)
  const currentParentId = deckQuery.data?.parentId ?? workspaceId
  const isRootContainer = currentParentId === workspaceId
  const folderPathQuery = useFolderPath(isRootContainer ? '' : currentParentId)
  const updateDeck = useUpdateDeck(deckId)
  const form = useForm<DeckEditorFormValues>({
    defaultValues: {
      description: '',
      icon: defaultDeckVisualIcon,
      title: '',
    },
    resolver: zodResolver(createDeckEditorSchema(t), undefined, { mode: 'sync' }),
  })
  const title = useController({ control: form.control, name: 'title' })
  const description = useController({ control: form.control, name: 'description' })
  const icon = useController({ control: form.control, name: 'icon' })
  const parentLocationPath = isRootContainer ? [t(($) => $.workspaces.labels.workspace)] : folderPathQuery.data
  const closeTo = useCloseTarget(`/dashboard/${workspaceId}/decks/${deckId}`)
  const serviceValidationMessages = updateDeck.isError
    ? {
        description: translateValidationIssuesForPath(
          t,
          updateDeck.error,
          ['description'],
          t(($) => $.common.labels.description),
        ),
        icon: translateValidationIssuesForPath(
          t,
          updateDeck.error,
          ['icon'],
          t(($) => $.common.labels.visual),
        ),
        title: translateValidationIssuesForPath(
          t,
          updateDeck.error,
          ['title'],
          t(($) => $.common.labels.name),
        ),
      }
    : undefined
  const formValidationMessages: DeckEditorValidationMessages = {
    description: fieldErrorMessages(form.formState.errors.description),
    icon: fieldErrorMessages(form.formState.errors.icon),
    title: fieldErrorMessages(form.formState.errors.title),
  }
  const validationMessages = mergeFieldValidationMessages(
    serviceValidationMessages,
    formValidationMessages,
  )

  const resetMutationError = () => {
    if (updateDeck.isError) {
      updateDeck.reset()
    }
  }

  const handleTitleChange = (nextTitle: string) => {
    resetMutationError()
    if (nextTitle.trim().length > 0) {
      form.clearErrors('title')
    }
    title.field.onChange(nextTitle)
  }

  const handleDescriptionChange = (nextDescription: string) => {
    resetMutationError()
    description.field.onChange(nextDescription)
  }

  const handleIconChange = (nextIcon: VisualIconName) => {
    resetMutationError()
    icon.field.onChange(nextIcon)
  }

  useEffect(() => {
    if (!deckQuery.data) {
      return
    }

    form.reset({
      description: deckQuery.data.description,
      icon: deckQuery.data.icon,
      title: deckQuery.data.title,
    })
  }, [deckQuery.data, form])

  if (deckQuery.isLoading) {
    return <EditorLoadingState backTo={closeTo} formKind="deck" title={t(($) => $.decks.actions.editDeck)} />
  }

  if (deckQuery.isError && !deckQuery.data) {
    return (
      <EditorErrorState
        backTo={closeTo}
        error={deckQuery.error}
        errorTitle={t(($) => $.decks.errors.deckCouldNotLoad)}
        title={t(($) => $.decks.actions.editDeck)}
        onRetry={() => {
          void deckQuery.refetch()
        }}
      />
    )
  }

  return (
    <EditorShell
      actionLabel={t(($) => $.common.actions.saveChanges)}
      actionError={
        updateDeck.isError
          ? { error: updateDeck.error, title: t(($) => $.decks.errors.couldNotSaveDeck) }
          : null
      }
      backTo={closeTo}
      isSubmitting={updateDeck.isPending}
      title={t(($) => $.decks.actions.editDeck)}
      onSubmit={form.handleSubmit((values) => {
        updateDeck.mutate(
          {
            description: values.description.trim(),
            icon: values.icon,
            parentId: currentParentId,
            title: values.title,
          },
          {
            onSuccess: () => {
              void navigate({
                params: { deckId, workspaceId },
                to: '/dashboard/$workspaceId/decks/$deckId',
              })
            },
          },
        )
      })}
    >
      {folderPathQuery.isError && folderPathQuery.data === undefined ? (
        <InlineErrorState
          className="mb-5"
          error={folderPathQuery.error}
          title={t(($) => $.decks.errors.couldNotLoadFolderPath)}
        />
      ) : null}
      <DeckEditorForm
        description={description.field.value}
        icon={icon.field.value}
        locationPath={parentLocationPath}
        title={title.field.value}
        validationMessages={validationMessages}
        onDescriptionChange={handleDescriptionChange}
        onIconChange={handleIconChange}
        onTitleChange={handleTitleChange}
      />
    </EditorShell>
  )
}
