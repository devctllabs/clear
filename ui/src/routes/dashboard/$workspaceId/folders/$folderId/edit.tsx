import { createFileRoute } from '@tanstack/react-router'

import { FolderEditPage } from '@features/folders'

const DashboardFolderEditRoute = () => {
  const { folderId, workspaceId } = Route.useParams()

  return <FolderEditPage folderId={folderId} workspaceId={workspaceId} />
}

export const Route = createFileRoute('/dashboard/$workspaceId/folders/$folderId/edit')({
  component: DashboardFolderEditRoute,
})
