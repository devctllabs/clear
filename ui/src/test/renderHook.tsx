import { cleanup, renderHook } from '@testing-library/react'
import type { PropsWithChildren } from 'react'

import { AppProviders } from '@core/providers/AppProviders'
import { createAppServices, type AppServices } from '@core/services'

export const renderHookWithProviders = <TResult, TProps>(
  callback: (props: TProps) => TResult,
  {
    initialProps,
    services = createAppServices('mock'),
  }: { initialProps?: TProps; services?: AppServices } = {},
) => {
  cleanup()

  return renderHook(callback, {
    initialProps,
    wrapper: ({ children }: PropsWithChildren) => (
      <AppProviders services={services}>{children}</AppProviders>
    ),
  })
}
