import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { VisualIconName } from '@shared/components/icons/IconGlyph'
import { EditorErrorState } from '@shared/components/layout/EditorErrorState'
import { EditorShell } from '@shared/components/layout/EditorShell'
import { EditorLoadingState } from '@shared/components/layout/EditorLoadingState'
import { useCloseTarget } from '@shared/lib/navigation-state'

import { WorkspaceEditorForm } from '../components/WorkspaceEditorForm'
import { defaultWorkspaceVisualIcon } from '../constants/visuals'
import { useUpdateWorkspace, useWorkspace } from '../hooks/useWorkspaces'

export const WorkspaceEditPage = ({ workspaceId }: { workspaceId: string }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const workspaceQuery = useWorkspace(workspaceId)
  const updateWorkspace = useUpdateWorkspace(workspaceId)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState<VisualIconName>(defaultWorkspaceVisualIcon)
  const closeTo = useCloseTarget(`/dashboard/${workspaceId}`)

  useEffect(() => {
    if (!workspaceQuery.data) {
      return
    }

    setTitle(workspaceQuery.data.title)
    setDescription(workspaceQuery.data.description)
    setIcon(workspaceQuery.data.icon)
  }, [workspaceQuery.data])

  if (workspaceQuery.isLoading) {
    return (
      <EditorLoadingState
        backTo={closeTo}
        formKind="workspace"
        title={t(($) => $.workspaces.actions.editWorkspace)}
      />
    )
  }

  if (workspaceQuery.isError && !workspaceQuery.data) {
    return (
      <EditorErrorState
        backTo={closeTo}
        error={workspaceQuery.error}
        errorTitle={t(($) => $.workspaces.errors.workspaceCouldNotLoad)}
        title={t(($) => $.workspaces.actions.editWorkspace)}
        onRetry={() => {
          void workspaceQuery.refetch()
        }}
      />
    )
  }

  return (
    <EditorShell
      actionLabel={t(($) => $.common.actions.saveChanges)}
      actionError={
        updateWorkspace.isError
          ? { error: updateWorkspace.error, title: t(($) => $.workspaces.errors.couldNotSaveWorkspace) }
          : null
      }
      backTo={closeTo}
      isSubmitting={updateWorkspace.isPending}
      title={t(($) => $.workspaces.actions.editWorkspace)}
      onSubmit={() => {
        updateWorkspace.mutate(
          {
            description,
            icon,
            title,
          },
          {
            onSuccess: () => {
              void navigate({ to: '/workspaces' })
            },
          },
        )
      }}
    >
      <WorkspaceEditorForm
        description={description}
        icon={icon}
        title={title}
        onDescriptionChange={setDescription}
        onIconChange={setIcon}
        onTitleChange={setTitle}
      />
    </EditorShell>
  )
}
