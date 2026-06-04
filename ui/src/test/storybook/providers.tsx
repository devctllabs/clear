import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  RouterContextProvider,
  createMemoryHistory,
  createRouter,
} from '@tanstack/react-router'
import type { Decorator } from '@storybook/react-vite'
import { useMemo, type ReactNode } from 'react'

import { routeTree } from '@/routeTree.gen'
import { AppI18nProvider } from '@core/i18n'
import { createAppServices, ServicesProvider, type AppServices } from '@core/services'

type StorybookAppProviderProps = {
  children: ReactNode
  initialEntry?: string
  services?: AppServices | (() => AppServices)
  setupQueryClient?: (queryClient: QueryClient) => void
}

const createStorybookQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      mutations: {
        retry: false,
      },
      queries: {
        refetchOnWindowFocus: false,
        retry: false,
        staleTime: Infinity,
      },
    },
  })

export const StorybookAppProvider = ({
  children,
  initialEntry = '/dashboard/independent-study',
  services,
  setupQueryClient,
}: StorybookAppProviderProps) => {
  const queryClient = useMemo(() => {
    const client = createStorybookQueryClient()

    setupQueryClient?.(client)

    return client
  }, [setupQueryClient])
  const resolvedServices = useMemo(
    () => (typeof services === 'function' ? services() : services ?? createAppServices('mock')),
    [services],
  )
  const router = useMemo(() => {
    const history = createMemoryHistory({ initialEntries: [initialEntry] })

    return createRouter({ history, routeTree })
  }, [initialEntry])

  return (
    <ServicesProvider services={resolvedServices}>
      <AppI18nProvider>
        <QueryClientProvider client={queryClient}>
          <RouterContextProvider router={router}>{children}</RouterContextProvider>
        </QueryClientProvider>
      </AppI18nProvider>
    </ServicesProvider>
  )
}

export const withStorybookApp =
  ({
    initialEntry,
    services,
    setupQueryClient,
  }: Omit<StorybookAppProviderProps, 'children'> = {}): Decorator =>
  (Story) => (
    <StorybookAppProvider
      initialEntry={initialEntry}
      services={services}
      setupQueryClient={setupQueryClient}
    >
      <Story />
    </StorybookAppProvider>
  )
