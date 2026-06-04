import { afterEach, describe, expect, it, vi } from 'vitest'

import { domainError, err, ok } from '@shared/errors'
import type { BootstrapResult } from '@shared/lib/runtime-profile'

import { tauriBootstrapService } from './bootstrapService'

const desktopBootstrapResult: BootstrapResult = {
  runtimeProfile: {
    formFactor: 'desktop',
    runtime: 'tauri',
  },
}

describe('tauriBootstrapService', () => {
  afterEach(() => {
    delete window.__TAURI_INTERNALS__
  })

  it('returns the runtime profile when bootstrap succeeds', () => {
    window.__TAURI_INTERNALS__ = {
      invoke: vi.fn(async () => desktopBootstrapResult),
    }

    return expect(tauriBootstrapService.bootstrap()).resolves.toEqual(
      ok(desktopBootstrapResult),
    )
  })

  it('returns the domain error emitted by invoke', () => {
    const invokeError = domainError.unavailable('Desktop runtime unavailable.')

    window.__TAURI_INTERNALS__ = {
      invoke: vi.fn(async () => {
        throw invokeError
      }),
    }

    return expect(tauriBootstrapService.bootstrap()).resolves.toEqual(err(invokeError))
  })

  it('falls back to an unexpected error for unknown invoke failures', () => {
    window.__TAURI_INTERNALS__ = {
      invoke: vi.fn(async () => {
        throw {}
      }),
    }

    return expect(tauriBootstrapService.bootstrap()).resolves.toEqual(
      err(domainError.unexpected('Bootstrap failed.')),
    )
  })
})
