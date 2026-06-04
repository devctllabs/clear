import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { InlineErrorState } from '@shared/components/feedback/LoadErrorState'
import { EditorErrorState } from '@shared/components/layout/EditorErrorState'
import { EditorShell } from '@shared/components/layout/EditorShell'
import { EditorLoadingState } from '@shared/components/layout/EditorLoadingState'
import { useCloseTarget } from '@shared/lib/navigation-state'

import { FolderEditorForm } from '../components/FolderEditorForm'
import { useFolder, useFolderPath, useUpdateFolder } from '../hooks/useFolders'

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
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const locationPath = isRootParent ? [t(($) => $.workspaces.labels.workspace)] : folderPathQuery.data
  const closeTo = useCloseTarget(`/dashboard/${workspaceId}/folders/${folderId}`)

  useEffect(() => {
    if (!folderQuery.data) {
      return
    }

    setName(folderQuery.data.name)
    setDescription(folderQuery.data.description)
  }, [folderQuery.data])

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
      onSubmit={() => {
        updateFolder.mutate(
          {
            description,
            name,
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
      }}
    >
      {folderPathQuery.isError && folderPathQuery.data === undefined ? (
        <InlineErrorState
          className="mb-5"
          error={folderPathQuery.error}
          title={t(($) => $.folders.errors.couldNotLoadFolderPath)}
        />
      ) : null}
      <FolderEditorForm
        description={description}
        locationPath={locationPath}
        name={name}
        onDescriptionChange={setDescription}
        onNameChange={setName}
      />
    </EditorShell>
  )
}
