import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'

import type { Settings } from '@api-generated/clear-api'
import { apiUrl, setupWebApiMsw } from '@/test/web-api-msw'

import { webSettingsService } from './settingsService'

const server = setupWebApiMsw()

const settings = {
  dailyNewLimit: 20,
  dailyReviewLimit: 120,
  fsrsParams: [0.4, 0.6, 2.4],
  fsrsRetention: 0.9,
  language: 'en-US',
  masteryHorizonDays: 30,
  newCardsOrder: 'mixed',
  timezone: 'UTC',
} satisfies Settings

describe('webSettingsService', () => {
  it('loads default settings through the web API', async () => {
    server.use(
      http.get(apiUrl('/settings/defaults'), () => HttpResponse.json(settings)),
    )

    await expect(webSettingsService.getDefaults()).resolves.toEqual({
      ok: true,
      value: settings,
    })
  })

  it('reads settings through the web API', async () => {
    server.use(http.get(apiUrl('/settings'), () => HttpResponse.json(settings)))

    await expect(webSettingsService.read()).resolves.toEqual({
      ok: true,
      value: settings,
    })
  })

  it('resets settings through the web API', async () => {
    server.use(
      http.post(apiUrl('/settings/reset'), () => HttpResponse.json(settings)),
    )

    await expect(webSettingsService.reset()).resolves.toEqual({
      ok: true,
      value: settings,
    })
  })

  it('writes settings through the web API', async () => {
    server.use(
      http.put(apiUrl('/settings'), async ({ request }) => {
        expect(await request.json()).toEqual(settings)

        return HttpResponse.json(settings)
      }),
    )

    await expect(webSettingsService.write(settings)).resolves.toEqual({
      ok: true,
      value: settings,
    })
  })
})
