import { createFileRoute } from '@tanstack/react-router'

import { DeckCreatePage } from '@features/decks'
import { FolderCreatePage } from '@features/folders'

const DashboardCreateRoute = () => {
  const { entityKind, workspaceId } = Route.useParams()

  return entityKind === 'folder' ? (
    <FolderCreatePage workspaceId={workspaceId} />
  ) : (
    <DeckCreatePage workspaceId={workspaceId} />
  )
}

export const Route = createFileRoute('/dashboard/$workspaceId/create/$entityKind')({
  component: DashboardCreateRoute,
})
