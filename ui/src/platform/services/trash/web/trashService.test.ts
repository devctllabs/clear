import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'

import type { TrashState } from '@api-generated/clear-api'
import { apiUrl, expectOk, setupWebApiMsw } from '@/test/web-api-msw'

import { webTrashService } from './trashService'

const server = setupWebApiMsw()

const trashState = {
  items: [
    {
      deletedAt: '2026-05-18T12:00:00.000Z',
      id: 'deleted-world-history',
      kind: 'deck',
      locationPath: ['Independent Study'],
      title: 'World History',
    },
  ],
  lastEmptiedAt: '2026-05-01T12:00:00.000Z',
} satisfies TrashState

describe('webTrashService', () => {
  it('permanently deletes trash items through the web API', async () => {
    server.use(
      http.delete(apiUrl('/trash/items/:itemId'), ({ params }) => {
        expect(params.itemId).toBe('deleted-world-history')

        return new HttpResponse(null, { status: 204 })
      }),
    )

    expectOk(await webTrashService.deleteItem('deleted-world-history'))
  })

  it('empties trash through the web API', async () => {
    server.use(
      http.delete(apiUrl('/trash'), () =>
        HttpResponse.json({ ...trashState, items: [] }),
      ),
    )

    await expect(webTrashService.empty()).resolves.toEqual({
      ok: true,
      value: { ...trashState, items: [] },
    })
  })

  it('loads trash through the web API', async () => {
    server.use(http.get(apiUrl('/trash'), () => HttpResponse.json(trashState)))

    await expect(webTrashService.list()).resolves.toEqual({
      ok: true,
      value: trashState,
    })
  })

  it('restores trash items through the web API', async () => {
    server.use(
      http.post(apiUrl('/trash/items/:itemId/restore'), ({ params }) => {
        expect(params.itemId).toBe('deleted-world-history')

        return new HttpResponse(null, { status: 204 })
      }),
    )

    expectOk(await webTrashService.restoreItem('deleted-world-history'))
  })
})
