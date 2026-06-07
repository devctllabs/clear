import { useNavigate } from '@tanstack/react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import type { TFunction } from 'i18next'
import { useController, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { InlineErrorState } from '@shared/components/feedback/LoadErrorState'
import {
  fieldErrorMessages,
  mergeFieldValidationMessages,
  requiredTrimmedText,
} from '@shared/components/forms/validation'
import { EditorShell } from '@shared/components/layout/EditorShell'
import { translateValidationIssuesForPath } from '@shared/errors/translation'
import { useCloseTarget } from '@shared/lib/navigation-state'

import { FolderEditorForm, type FolderEditorValidationMessages } from '../components/FolderEditorForm'
import { useCreateFolder, useFolderPath } from '../hooks/useFolders'

const createFolderEditorSchema = (t: TFunction) =>
  z.object({
    description: z.string(),
    name: requiredTrimmedText(t, t(($) => $.common.labels.name)),
  })

type FolderEditorFormValues = z.infer<ReturnType<typeof createFolderEditorSchema>>

export const FolderCreatePage = ({
  folderId,
  workspaceId,
}: {
  folderId?: string
  workspaceId: string
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createFolder = useCreateFolder()
  const targetFolderId = folderId ?? workspaceId
  const isRootTarget = targetFolderId === workspaceId
  const folderPathQuery = useFolderPath(isRootTarget ? '' : targetFolderId)
  const form = useForm<FolderEditorFormValues>({
    defaultValues: {
      description: '',
      name: '',
    },
    resolver: zodResolver(createFolderEditorSchema(t), undefined, { mode: 'sync' }),
  })
  const name = useController({ control: form.control, name: 'name' })
  const description = useController({ control: form.control, name: 'description' })
  const backTo = isRootTarget
    ? `/dashboard/${workspaceId}`
    : `/dashboard/${workspaceId}/folders/${targetFolderId}`
  const closeTo = useCloseTarget(backTo)
  const locationPath = isRootTarget ? [t(($) => $.workspaces.labels.workspace)] : folderPathQuery.data
  const serviceValidationMessages = createFolder.isError
    ? {
        description: translateValidationIssuesForPath(
          t,
          createFolder.error,
          ['description'],
          t(($) => $.common.labels.description),
        ),
        name: translateValidationIssuesForPath(
          t,
          createFolder.error,
          ['name'],
          t(($) => $.common.labels.name),
        ),
      }
    : undefined
  const formValidationMessages: FolderEditorValidationMessages = {
    description: fieldErrorMessages(form.formState.errors.description),
    name: fieldErrorMessages(form.formState.errors.name),
  }
  const validationMessages = mergeFieldValidationMessages(
    serviceValidationMessages,
    formValidationMessages,
  )

  const resetMutationError = () => {
    if (createFolder.isError) {
      createFolder.reset()
    }
  }

  const handleNameChange = (nextName: string) => {
    resetMutationError()
    if (nextName.trim().length > 0) {
      form.clearErrors('name')
    }
    name.field.onChange(nextName)
  }

  const handleDescriptionChange = (nextDescription: string) => {
    resetMutationError()
    description.field.onChange(nextDescription)
  }

  return (
    <EditorShell
      actionLabel={t(($) => $.folders.actions.createFolder)}
      actionError={
        createFolder.isError
          ? { error: createFolder.error, title: t(($) => $.folders.errors.couldNotCreateFolder) }
          : null
      }
      backTo={closeTo}
      isSubmitting={createFolder.isPending}
      title={t(($) => $.folders.labels.createFolderTitle)}
      onSubmit={form.handleSubmit((values) => {
        createFolder.mutate(
          {
            description: values.description.trim(),
            name: values.name,
            parentId: targetFolderId,
          },
          {
            onSuccess: (folder) => {
              void navigate({
                params: { folderId: folder.id, workspaceId },
                to: '/dashboard/$workspaceId/folders/$folderId',
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
          title={t(($) => $.folders.errors.couldNotLoadFolderPath)}
        />
      ) : null}
      <FolderEditorForm
        description={description.field.value}
        locationPath={locationPath}
        name={name.field.value}
        validationMessages={validationMessages}
        onDescriptionChange={handleDescriptionChange}
        onNameChange={handleNameChange}
      />
    </EditorShell>
  )
}
