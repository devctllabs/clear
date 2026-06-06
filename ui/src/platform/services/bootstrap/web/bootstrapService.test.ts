import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'

import type { BootstrapResult } from '@api-generated/clear-api'
import { apiUrl, setupWebApiMsw } from '@/test/web-api-msw'

import { webBootstrapService } from './bootstrapService'

const server = setupWebApiMsw()

const bootstrapResult = {
  runtimeProfile: {
    formFactor: 'desktop',
    runtime: 'web',
  },
} satisfies BootstrapResult

describe('webBootstrapService', () => {
  it('bootstraps runtime data through the web API', async () => {
    server.use(
      http.post(apiUrl('/bootstrap'), () => HttpResponse.json(bootstrapResult)),
    )

    await expect(webBootstrapService.bootstrap()).resolves.toEqual({
      ok: true,
      value: bootstrapResult,
    })
  })
})
