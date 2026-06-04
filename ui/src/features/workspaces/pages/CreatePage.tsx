import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { EditorShell } from '@shared/components/layout/EditorShell'
import { useCloseTarget } from '@shared/lib/navigation-state'
import type { VisualIconName } from '@shared/components/icons/IconGlyph'

import { WorkspaceEditorForm } from '../components/WorkspaceEditorForm'
import { defaultWorkspaceVisualIcon } from '../constants/visuals'
import { useCreateWorkspace } from '../hooks/useWorkspaces'

export const WorkspaceCreatePage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createWorkspace = useCreateWorkspace()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState<VisualIconName>(defaultWorkspaceVisualIcon)
  const closeTo = useCloseTarget('/workspaces')

  return (
    <EditorShell
      actionLabel={t(($) => $.workspaces.actions.createWorkspace)}
      actionError={
        createWorkspace.isError
          ? { error: createWorkspace.error, title: t(($) => $.workspaces.errors.couldNotCreateWorkspace) }
          : null
      }
      backTo={closeTo}
      isSubmitting={createWorkspace.isPending}
      title={t(($) => $.workspaces.labels.createWorkspaceTitle)}
      onSubmit={() => {
        createWorkspace.mutate(
          {
            description: description.trim() || t(($) => $.workspaces.descriptions.editorDefault),
            icon,
            title: title.trim() || t(($) => $.workspaces.fields.untitledWorkspace),
          },
          {
            onSuccess: (workspace) => {
              void navigate({
                params: { workspaceId: workspace.id },
                to: '/dashboard/$workspaceId',
              })
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
