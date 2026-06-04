import { afterEach, describe, expect, it, vi } from 'vitest'

import { mockBootstrapService } from '@platform/services/bootstrap/mock/bootstrapService'
import { tauriBootstrapService } from '@platform/services/bootstrap/tauri/bootstrapService'
import { webBootstrapService } from '@platform/services/bootstrap/web/bootstrapService'

import { createAppServices } from './service-registry'

describe('createAppServices', () => {
  afterEach(() => {
    delete window.__TAURI_INTERNALS__
    vi.unstubAllEnvs()
  })

  it('uses supported environment service modes and falls back to auto web mode', () => {
    vi.stubEnv('VITE_SERVICE_MODE', 'web')
    expect(createAppServices()).toMatchObject({
      bootstrap: webBootstrapService,
      configuredMode: 'web',
      mode: 'web',
      runtime: 'web',
    })

    vi.stubEnv('VITE_SERVICE_MODE', 'tauri')
    expect(createAppServices()).toMatchObject({
      bootstrap: tauriBootstrapService,
      configuredMode: 'tauri',
      mode: 'tauri',
      runtime: 'web',
    })

    vi.stubEnv('VITE_SERVICE_MODE', 'mock')
    expect(createAppServices()).toMatchObject({
      bootstrap: mockBootstrapService,
      configuredMode: 'mock',
      mode: 'mock',
      runtime: 'web',
    })

    vi.stubEnv('VITE_SERVICE_MODE', 'unknown')
    expect(createAppServices()).toMatchObject({
      configuredMode: 'auto',
      mode: 'web',
      runtime: 'web',
    })
  })

  it('resolves auto mode to tauri when the Tauri runtime is present', () => {
    window.__TAURI_INTERNALS__ = {}

    expect(createAppServices('auto')).toMatchObject({
      bootstrap: tauriBootstrapService,
      configuredMode: 'auto',
      mode: 'tauri',
      runtime: 'tauri',
    })
  })
})
