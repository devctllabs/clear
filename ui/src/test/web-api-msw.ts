import { afterAll, afterEach, beforeAll } from 'vitest'
import { setupServer } from 'msw/node'

import { client } from '@api-generated/clear-api/client.gen'
import type { Result } from '@shared/errors'

export const WEB_API_BASE_URL = 'http://clear.test/api/v1'

export const apiUrl = (path: `/${string}`) => `${WEB_API_BASE_URL}${path}`

export const setupWebApiMsw = () => {
  const server = setupServer()
  const initialConfig = client.getConfig()

  beforeAll(() => {
    client.setConfig({
      baseURL: WEB_API_BASE_URL,
      throwOnError: true,
    })
    server.listen({ onUnhandledRequest: 'error' })
  })

  afterEach(() => {
    server.resetHandlers()
  })

  afterAll(() => {
    server.close()
    client.setConfig(initialConfig)
  })

  return server
}

export const expectOk = <T>(result: Result<T>) => {
  if (!result.ok) {
    throw new Error(`Expected ok result, received ${result.error.type}`)
  }

  return result.value
}

export const expectErr = <T>(result: Result<T>) => {
  if (result.ok) {
    throw new Error('Expected error result')
  }

  return result.error
}
