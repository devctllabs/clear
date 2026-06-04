import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { EditorShell } from '@shared/components/layout/EditorShell'
import { useCloseTarget } from '@shared/lib/navigation-state'
import type { VisualIconName } from '@shared/components/icons/IconGlyph'

import { WorkspaceEditorForm } from '../components/WorkspaceEditorForm'
import { defaultWorkspaceVisualIcon } from '../constants/visuals'
import { useCreateWorkspace } from '../hooks/useWorkspaces'

export const WorkspaceCreatePage = () => {
  const navigate = useNavigate()
  const createWorkspace = useCreateWorkspace()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState<VisualIconName>(defaultWorkspaceVisualIcon)
  const closeTo = useCloseTarget('/workspaces')

  return (
    <EditorShell
      actionLabel="Create workspace"
      actionError={
        createWorkspace.isError
          ? { error: createWorkspace.error, title: 'Could not create workspace' }
          : null
      }
      backTo={closeTo}
      isSubmitting={createWorkspace.isPending}
      title="Create Workspace"
      onSubmit={() => {
        createWorkspace.mutate(
          {
            description: description.trim() || 'Study context.',
            icon,
            title: title.trim() || 'Untitled Workspace',
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
