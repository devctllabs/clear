import { createFileRoute } from '@tanstack/react-router'

import { MenuPage } from '@features/menu'

export const Route = createFileRoute('/menu/')({
  component: MenuPage,
})
