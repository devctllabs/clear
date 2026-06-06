import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'

import type { SearchResultGroup, SearchScope } from '@api-generated/clear-api'
import { apiUrl, setupWebApiMsw } from '@/test/web-api-msw'

import { webContentSearchService } from './contentSearchService'

const server = setupWebApiMsw()

const scope = {
  kind: 'workspace',
  workspaceId: 'independent-study',
} satisfies SearchScope

const searchGroups = [
  {
    kind: 'folder',
    results: [
      {
        id: 'reading-notes',
        kind: 'folder',
        locationPath: ['Independent Study'],
        title: 'Reading Notes',
        updatedAt: '2026-05-15T12:00:00.000Z',
        workspaceId: 'independent-study',
      },
    ],
  },
  {
    kind: 'deck',
    results: [
      {
        deckIcon: 'book-open',
        id: 'world-history',
        kind: 'deck',
        locationPath: ['Independent Study', 'Reading Notes'],
        title: 'World History',
        updatedAt: '2026-05-15T12:00:00.000Z',
        workspaceId: 'independent-study',
      },
    ],
  },
  {
    kind: 'note',
    results: [
      {
        deckId: 'world-history',
        id: 'industrial-revolution-causes',
        kind: 'note',
        locationPath: ['Independent Study', 'Reading Notes', 'World History'],
        noteKind: 'basic',
        title: 'Industrial Revolution Causes',
        updatedAt: '2026-05-12T12:00:00.000Z',
        workspaceId: 'independent-study',
      },
    ],
  },
] satisfies SearchResultGroup[]

describe('webContentSearchService', () => {
  it('searches content through the web API and maps all result groups', async () => {
    server.use(
      http.post(apiUrl('/search'), async ({ request }) => {
        expect(await request.json()).toEqual({
          query: 'history',
          scope,
        })

        return HttpResponse.json(searchGroups)
      }),
    )

    await expect(
      webContentSearchService.search(scope, 'history'),
    ).resolves.toEqual({
      ok: true,
      value: searchGroups,
    })
  })
})
