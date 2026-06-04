import { QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'

import { queryClient } from '@core/query/query-client'
import type { AppServices } from '@core/services'
import { ServicesProvider } from '@core/services'
import { AppRuntimeProfileProvider } from '@shared/hooks/useAppLayoutMode'
import type { RuntimeProfile } from '@shared/lib/runtime-profile'

export const AppProviders = ({
  children,
  runtimeProfile,
  services,
}: PropsWithChildren<{ runtimeProfile?: RuntimeProfile; services?: AppServices }>) => (
  <AppRuntimeProfileProvider initialProfile={runtimeProfile}>
    <ServicesProvider services={services}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ServicesProvider>
  </AppRuntimeProfileProvider>
)
