import { createFileRoute } from '@tanstack/react-router'

import { BootPage } from '@features/bootstrap'

export const Route = createFileRoute('/boot')({
  component: BootPage,
})
