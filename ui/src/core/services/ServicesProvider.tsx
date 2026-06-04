import { createContext, useMemo, type PropsWithChildren } from 'react'

import { createAppServices, type AppServices } from './service-registry'

export const AppServicesContext = createContext<AppServices | null>(null)

export const ServicesProvider = ({
  children,
  services,
}: PropsWithChildren<{ services?: AppServices }>) => {
  const value = useMemo(() => services ?? createAppServices(), [services])

  return (
    <AppServicesContext.Provider value={value}>{children}</AppServicesContext.Provider>
  )
}
