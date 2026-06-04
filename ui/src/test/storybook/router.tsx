import { useMemo, type ReactNode } from 'react'
import type { Decorator } from '@storybook/react-vite'
import {
  RouterContextProvider,
  createMemoryHistory,
  createRouter,
} from '@tanstack/react-router'

import { routeTree } from '@/routeTree.gen'

export const StorybookRouterProvider = ({
  children,
  initialEntry = '/dashboard/independent-study',
}: {
  children: ReactNode
  initialEntry?: string
}) => {
  const router = useMemo(() => {
    const history = createMemoryHistory({ initialEntries: [initialEntry] })

    return createRouter({ history, routeTree })
  }, [initialEntry])

  return <RouterContextProvider router={router}>{children}</RouterContextProvider>
}

export const withStorybookRouter =
  (initialEntry?: string): Decorator =>
  (Story) => (
    <StorybookRouterProvider initialEntry={initialEntry}>
      <Story />
    </StorybookRouterProvider>
  )
