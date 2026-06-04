import { createFileRoute } from '@tanstack/react-router'

import { WorkspaceListPage } from '@features/workspaces'

export const Route = createFileRoute('/workspaces/')({
  component: WorkspaceListPage,
})
