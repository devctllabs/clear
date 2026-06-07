import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
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
import { EditorErrorState } from '@shared/components/layout/EditorErrorState'
import { EditorShell } from '@shared/components/layout/EditorShell'
import { EditorLoadingState } from '@shared/components/layout/EditorLoadingState'
import { translateValidationIssuesForPath } from '@shared/errors/translation'
import { useCloseTarget } from '@shared/lib/navigation-state'

import { FolderEditorForm, type FolderEditorValidationMessages } from '../components/FolderEditorForm'
import { useFolder, useFolderPath, useUpdateFolder } from '../hooks/useFolders'

const createFolderEditorSchema = (t: TFunction) =>
  z.object({
    description: z.string(),
    name: requiredTrimmedText(t, t(($) => $.common.labels.name)),
  })

type FolderEditorFormValues = z.infer<ReturnType<typeof createFolderEditorSchema>>

export const FolderEditPage = ({
  folderId,
  workspaceId,
}: {
  folderId: string
  workspaceId: string
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const folderQuery = useFolder(folderId)
  const currentParentFolderId = folderQuery.data?.parentId ?? workspaceId
  const isRootParent = currentParentFolderId === workspaceId
  const folderPathQuery = useFolderPath(isRootParent ? '' : currentParentFolderId)
  const updateFolder = useUpdateFolder(folderId)
  const form = useForm<FolderEditorFormValues>({
    defaultValues: {
      description: '',
      name: '',
    },
    resolver: zodResolver(createFolderEditorSchema(t), undefined, { mode: 'sync' }),
  })
  const name = useController({ control: form.control, name: 'name' })
  const description = useController({ control: form.control, name: 'description' })
  const locationPath = isRootParent ? [t(($) => $.workspaces.labels.workspace)] : folderPathQuery.data
  const closeTo = useCloseTarget(`/dashboard/${workspaceId}/folders/${folderId}`)
  const serviceValidationMessages = updateFolder.isError
    ? {
        description: translateValidationIssuesForPath(
          t,
          updateFolder.error,
          ['description'],
          t(($) => $.common.labels.description),
        ),
        name: translateValidationIssuesForPath(
          t,
          updateFolder.error,
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
    if (updateFolder.isError) {
      updateFolder.reset()
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

  useEffect(() => {
    if (!folderQuery.data) {
      return
    }

    form.reset({
      description: folderQuery.data.description,
      name: folderQuery.data.name,
    })
  }, [folderQuery.data, form])

  if (folderQuery.isLoading) {
    return <EditorLoadingState backTo={closeTo} formKind="folder" title={t(($) => $.folders.actions.editFolder)} />
  }

  if (folderQuery.isError && !folderQuery.data) {
    return (
      <EditorErrorState
        backTo={closeTo}
        error={folderQuery.error}
        errorTitle={t(($) => $.folders.errors.folderCouldNotLoad)}
        title={t(($) => $.folders.actions.editFolder)}
        onRetry={() => {
          void folderQuery.refetch()
        }}
      />
    )
  }

  return (
    <EditorShell
      actionLabel={t(($) => $.common.actions.saveChanges)}
      actionError={
        updateFolder.isError
          ? { error: updateFolder.error, title: t(($) => $.folders.errors.couldNotSaveFolder) }
          : null
      }
      backTo={closeTo}
      isSubmitting={updateFolder.isPending}
      title={t(($) => $.folders.actions.editFolder)}
      onSubmit={form.handleSubmit((values) => {
        updateFolder.mutate(
          {
            description: values.description.trim(),
            name: values.name,
            parentId: currentParentFolderId,
          },
          {
            onSuccess: () => {
              void navigate({
                params: { folderId, workspaceId },
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
