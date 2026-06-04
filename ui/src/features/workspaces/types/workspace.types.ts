import type { VisualIconName } from '@shared/components/icons/IconGlyph'

export type Workspace = {
  description: string
  icon: VisualIconName
  id: string
  title: string
  updatedAt: string
}

export type WorkspaceListResult = {
  activeWorkspaceId: string | null
  workspaces: Workspace[]
}

export type WorkspaceDraft = {
  description: string
  icon: VisualIconName
  title: string
}
