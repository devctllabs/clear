import {
  createContext,
  useCallback,
  useContext,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from 'react'

import {
  getInitialRuntimeProfile,
  type AppLayoutMode,
  type RuntimeProfile,
} from '@shared/lib/runtime-profile'

const RuntimeProfileContext = createContext<RuntimeProfile | null>(null)
const RuntimeProfileSetterContext =
  createContext<Dispatch<SetStateAction<RuntimeProfile>> | null>(null)

export const AppRuntimeProfileProvider = ({
  children,
  initialProfile,
}: PropsWithChildren<{ initialProfile?: RuntimeProfile }>) => {
  const [runtimeProfile, setRuntimeProfile] = useState<RuntimeProfile>(
    () => initialProfile ?? getInitialRuntimeProfile(),
  )

  return (
    <RuntimeProfileContext.Provider value={runtimeProfile}>
      <RuntimeProfileSetterContext.Provider value={setRuntimeProfile}>
        {children}
      </RuntimeProfileSetterContext.Provider>
    </RuntimeProfileContext.Provider>
  )
}

export const useRuntimeProfile = () =>
  useContext(RuntimeProfileContext) ?? getInitialRuntimeProfile()

export const useSetRuntimeProfile = () => {
  const setRuntimeProfile = useContext(RuntimeProfileSetterContext)

  return useCallback(
    (runtimeProfile: RuntimeProfile) => {
      setRuntimeProfile?.(runtimeProfile)
    },
    [setRuntimeProfile],
  )
}

export const useAppLayoutMode = (): AppLayoutMode => useRuntimeProfile().formFactor

export const useIsDesktopLayout = () => useAppLayoutMode() === 'desktop'
