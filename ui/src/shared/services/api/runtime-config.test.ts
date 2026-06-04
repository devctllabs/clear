import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createClientConfig } from './runtime-config'

describe('createClientConfig', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_CLEAR_API_BASE_URL', '')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('uses the generated base URL when env is blank', () => {
    expect(createClientConfig({ baseURL: '/api/v1' }).baseURL).toBe('/api/v1')
  })

  it('uses the env base URL when it is provided', () => {
    vi.stubEnv('VITE_CLEAR_API_BASE_URL', 'https://api.clear.test/api/v1')

    expect(createClientConfig({ baseURL: '/api/v1' }).baseURL).toBe(
      'https://api.clear.test/api/v1',
    )
  })

  it('trims whitespace and trailing slashes from env base URL', () => {
    vi.stubEnv('VITE_CLEAR_API_BASE_URL', '  https://api.clear.test/api/v1///  ')

    expect(createClientConfig({ baseURL: '/api/v1' }).baseURL).toBe(
      'https://api.clear.test/api/v1',
    )
  })

  it('falls back to /api/v1 when env and generated config are empty', () => {
    vi.stubEnv('VITE_CLEAR_API_BASE_URL', '   ')

    expect(createClientConfig().baseURL).toBe('/api/v1')
  })
})
