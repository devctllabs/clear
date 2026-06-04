import { createFileRoute } from '@tanstack/react-router'

import { DashboardPage } from '@features/dashboard'

const DashboardWorkspaceRoute = () => {
  const { workspaceId } = Route.useParams()

  return <DashboardPage workspaceId={workspaceId} />
}

export const Route = createFileRoute('/dashboard/$workspaceId/')({
  component: DashboardWorkspaceRoute,
})
