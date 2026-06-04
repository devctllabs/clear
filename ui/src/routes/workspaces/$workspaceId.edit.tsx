import { createFileRoute } from '@tanstack/react-router'

import { WorkspaceEditPage } from '@features/workspaces'

const WorkspacesEditRoute = () => {
  const { workspaceId } = Route.useParams()

  return <WorkspaceEditPage workspaceId={workspaceId} />
}

export const Route = createFileRoute('/workspaces/$workspaceId/edit')({
  component: WorkspacesEditRoute,
})
