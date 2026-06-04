import { createFileRoute } from '@tanstack/react-router'

import { WorkspaceCreatePage } from '@features/workspaces'

const WorkspacesNewRoute = () => <WorkspaceCreatePage />

export const Route = createFileRoute('/workspaces/new')({
  component: WorkspacesNewRoute,
})
