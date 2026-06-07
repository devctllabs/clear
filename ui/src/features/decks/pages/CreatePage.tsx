import { useNavigate } from '@tanstack/react-router'
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
import { EditorShell } from '@shared/components/layout/EditorShell'
import { translateValidationIssuesForPath } from '@shared/errors/translation'
import { useCloseTarget } from '@shared/lib/navigation-state'

import { DeckEditorForm, type DeckEditorValidationMessages } from '../components/DeckEditorForm'
import { defaultDeckVisualIcon } from '../constants/visuals'
import { useCreateDeck } from '../hooks/useDecks'

const createDeckEditorSchema = (t: TFunction) =>
  z.object({
    description: z.string(),
    icon: z.custom<VisualIconName>(isVisualIconName, {
      message: requiredFieldMessage(t, t(($) => $.common.labels.visual)),
    }),
    title: requiredTrimmedText(t, t(($) => $.common.labels.name)),
  })

type DeckEditorFormValues = z.infer<ReturnType<typeof createDeckEditorSchema>>

export const DeckCreatePage = ({
  folderId,
  workspaceId,
}: {
  folderId?: string
  workspaceId: string
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createDeck = useCreateDeck()
  const targetFolderId = folderId ?? workspaceId
  const isRootTarget = targetFolderId === workspaceId
  const folderPathQuery = useFolderPath(isRootTarget ? '' : targetFolderId)
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
  const backTo = isRootTarget
    ? `/dashboard/${workspaceId}`
    : `/dashboard/${workspaceId}/folders/${targetFolderId}`
  const closeTo = useCloseTarget(backTo)
  const locationPath = isRootTarget ? [t(($) => $.workspaces.labels.workspace)] : folderPathQuery.data
  const serviceValidationMessages = createDeck.isError
    ? {
        description: translateValidationIssuesForPath(
          t,
          createDeck.error,
          ['description'],
          t(($) => $.common.labels.description),
        ),
        icon: translateValidationIssuesForPath(
          t,
          createDeck.error,
          ['icon'],
          t(($) => $.common.labels.visual),
        ),
        title: translateValidationIssuesForPath(
          t,
          createDeck.error,
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
    if (createDeck.isError) {
      createDeck.reset()
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

  return (
    <EditorShell
      actionLabel={t(($) => $.decks.actions.createDeck)}
      actionError={
        createDeck.isError
          ? { error: createDeck.error, title: t(($) => $.decks.errors.couldNotCreateDeck) }
          : null
      }
      backTo={closeTo}
      isSubmitting={createDeck.isPending}
      title={t(($) => $.decks.labels.createDeckTitle)}
      onSubmit={form.handleSubmit((values) => {
        createDeck.mutate(
          {
            description: values.description.trim(),
            icon: values.icon,
            parentId: targetFolderId,
            title: values.title,
          },
          {
            onSuccess: (deck) => {
              void navigate({
                params: { deckId: deck.id, workspaceId },
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
        locationPath={locationPath}
        title={title.field.value}
        validationMessages={validationMessages}
        onDescriptionChange={handleDescriptionChange}
        onIconChange={handleIconChange}
        onTitleChange={handleTitleChange}
      />
    </EditorShell>
  )
}
