import { createFileRoute } from '@tanstack/react-router'

import { DeckCreatePage } from '@features/decks'
import { FolderCreatePage } from '@features/folders'

const DashboardFolderCreateRoute = () => {
  const { entityKind, folderId, workspaceId } = Route.useParams()

  return entityKind === 'folder' ? (
    <FolderCreatePage folderId={folderId} workspaceId={workspaceId} />
  ) : (
    <DeckCreatePage folderId={folderId} workspaceId={workspaceId} />
  )
}

export const Route = createFileRoute(
  '/dashboard/$workspaceId/folders/$folderId/create/$entityKind',
)({
  component: DashboardFolderCreateRoute,
})
