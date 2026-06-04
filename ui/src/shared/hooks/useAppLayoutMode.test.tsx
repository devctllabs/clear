import { renderHook } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { describe, expect, it } from 'vitest'

import type { RuntimeProfile } from '@shared/lib/runtime-profile'

import {
  AppRuntimeProfileProvider,
  useAppLayoutMode,
  useIsDesktopLayout,
} from './useAppLayoutMode'

const createWrapper =
  (runtimeProfile: RuntimeProfile) =>
  ({ children }: PropsWithChildren) => (
    <AppRuntimeProfileProvider initialProfile={runtimeProfile}>
      {children}
    </AppRuntimeProfileProvider>
  )

describe('useAppLayoutMode', () => {
  it('returns desktop when the runtime profile is desktop', () => {
    const { result } = renderHook(() => useAppLayoutMode(), {
      wrapper: createWrapper({
        formFactor: 'desktop',
        runtime: 'tauri',
      }),
    })

    expect(result.current).toBe('desktop')
  })

  it('returns mobile when the runtime profile is mobile', () => {
    const { result } = renderHook(() => useAppLayoutMode(), {
      wrapper: createWrapper({
        formFactor: 'mobile',
        runtime: 'tauri',
      }),
    })

    expect(result.current).toBe('mobile')
  })
})

describe('useIsDesktopLayout', () => {
  it('returns true when the runtime profile is desktop', () => {
    const { result } = renderHook(() => useIsDesktopLayout(), {
      wrapper: createWrapper({
        formFactor: 'desktop',
        runtime: 'tauri',
      }),
    })

    expect(result.current).toBe(true)
  })

  it('returns false when the runtime profile is mobile', () => {
    const { result } = renderHook(() => useIsDesktopLayout(), {
      wrapper: createWrapper({
        formFactor: 'mobile',
        runtime: 'tauri',
      }),
    })

    expect(result.current).toBe(false)
  })
})
