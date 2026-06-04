import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { InlineErrorState } from '@shared/components/feedback/LoadErrorState'
import { EditorShell } from '@shared/components/layout/EditorShell'
import { useCloseTarget } from '@shared/lib/navigation-state'

import { FolderEditorForm } from '../components/FolderEditorForm'
import { useCreateFolder, useFolderPath } from '../hooks/useFolders'

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
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const backTo = isRootTarget
    ? `/dashboard/${workspaceId}`
    : `/dashboard/${workspaceId}/folders/${targetFolderId}`
  const closeTo = useCloseTarget(backTo)
  const locationPath = isRootTarget ? [t(($) => $.workspaces.labels.workspace)] : folderPathQuery.data

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
      onSubmit={() => {
        createFolder.mutate(
          {
            description: description.trim() || t(($) => $.folders.descriptions.editorDefault),
            name: name.trim() || t(($) => $.folders.fields.untitledFolder),
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
