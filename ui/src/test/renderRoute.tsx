import { cleanup, render } from '@testing-library/react'
import { RouterProvider, createMemoryHistory, createRouter } from '@tanstack/react-router'

import { AppProviders } from '@core/providers/AppProviders'
import { createAppServices, type AppServices } from '@core/services'
import { routeTree } from '@/routeTree.gen'

export const renderRoute = (
  path: string,
  { services = createAppServices('mock') }: { services?: AppServices } = {},
) => {
  cleanup()

  const history = createMemoryHistory({ initialEntries: [path] })
  const router = createRouter({ history, routeTree })

  const result = render(
    <AppProviders services={services}>
      <RouterProvider router={router} />
    </AppProviders>,
  )

  return { ...result, router }
}
