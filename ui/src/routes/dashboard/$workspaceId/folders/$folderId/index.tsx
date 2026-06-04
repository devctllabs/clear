import { createFileRoute } from '@tanstack/react-router'

import { FolderDetailPage } from '@features/folders'

const DashboardFolderRoute = () => {
  const { folderId, workspaceId } = Route.useParams()

  return <FolderDetailPage folderId={folderId} workspaceId={workspaceId} />
}

export const Route = createFileRoute('/dashboard/$workspaceId/folders/$folderId/')({
  component: DashboardFolderRoute,
})
