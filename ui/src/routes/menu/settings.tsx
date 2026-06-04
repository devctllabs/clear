import { createFileRoute } from '@tanstack/react-router'

import { SettingsPage } from '@features/settings'

export const Route = createFileRoute('/menu/settings')({
  component: SettingsPage,
})
