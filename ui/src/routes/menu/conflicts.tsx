import { createFileRoute } from '@tanstack/react-router'

import { ConflictsPage } from '@features/conflicts'

export const Route = createFileRoute('/menu/conflicts')({
  component: ConflictsPage,
})
