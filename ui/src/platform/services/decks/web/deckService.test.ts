import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'

import type { Deck, DeckDraft } from '@api-generated/clear-api'
import { DomainErrorType } from '@shared/errors'
import {
  apiUrl,
  expectErr,
  expectOk,
  setupWebApiMsw,
} from '@/test/web-api-msw'

import { webDeckService } from './deckService'

const server = setupWebApiMsw()

const deck = {
  description: 'Global institutions.',
  dueToday: 2,
  icon: 'book-open',
  id: 'world-history',
  parentId: 'reading-notes',
  progress: 82,
  title: 'World History',
  totalNotes: 3,
  updatedAt: '2026-05-15T12:00:00.000Z',
  workspaceId: 'independent-study',
} satisfies Deck

const draft = {
  description: 'Updated global institutions.',
  icon: 'book-open',
  parentId: 'reading-notes',
  title: 'World History Updated',
} as const satisfies DeckDraft

describe('webDeckService', () => {
  it('creates decks through the web API', async () => {
    server.use(
      http.post(apiUrl('/decks'), async ({ request }) => {
        expect(await request.json()).toEqual(draft)

        return HttpResponse.json(deck, { status: 201 })
      }),
    )

    await expect(webDeckService.create(draft)).resolves.toEqual({
      ok: true,
      value: deck,
    })
  })

  it('moves decks to trash through the web API', async () => {
    server.use(
      http.delete(apiUrl('/decks/:deckId'), ({ params }) => {
        expect(params.deckId).toBe('world-history')

        return new HttpResponse(null, { status: 204 })
      }),
    )

    expectOk(await webDeckService.delete('world-history'))
  })

  it('loads a deck by id through the web API', async () => {
    server.use(
      http.get(apiUrl('/decks/:deckId'), ({ params }) => {
        expect(params.deckId).toBe('world-history')

        return HttpResponse.json(deck)
      }),
    )

    await expect(webDeckService.getById('world-history')).resolves.toEqual({
      ok: true,
      value: deck,
    })
  })

  it('lists folder decks with sort query params', async () => {
    server.use(
      http.get(apiUrl('/folders/:folderId/decks'), ({ params, request }) => {
        const url = new URL(request.url)

        expect(params.folderId).toBe('reading-notes')
        expect(url.searchParams.get('sortDirection')).toBe('desc')
        expect(url.searchParams.get('sortField')).toBe('updatedAt')

        return HttpResponse.json([deck])
      }),
    )

    await expect(
      webDeckService.listFolderChildren('reading-notes', {
        direction: 'desc',
        field: 'updatedAt',
      }),
    ).resolves.toEqual({
      ok: true,
      value: [deck],
    })
  })

  it('lists workspace root decks with sort query params', async () => {
    server.use(
      http.get(apiUrl('/workspaces/:workspaceId/decks'), ({ params, request }) => {
        const url = new URL(request.url)

        expect(params.workspaceId).toBe('independent-study')
        expect(url.searchParams.get('sortDirection')).toBe('asc')
        expect(url.searchParams.get('sortField')).toBe('title')

        return HttpResponse.json([deck])
      }),
    )

    await expect(
      webDeckService.listWorkspaceRoot('independent-study', {
        direction: 'asc',
        field: 'title',
      }),
    ).resolves.toEqual({
      ok: true,
      value: [deck],
    })
  })

  it('updates decks through the web API', async () => {
    server.use(
      http.put(apiUrl('/decks/:deckId'), async ({ params, request }) => {
        expect(params.deckId).toBe('world-history')
        expect(await request.json()).toEqual(draft)

        return HttpResponse.json({ ...deck, ...draft })
      }),
    )

    await expect(webDeckService.update('world-history', draft)).resolves.toEqual({
      ok: true,
      value: { ...deck, ...draft },
    })
  })

  it('maps API validation errors to domain validation errors', async () => {
    server.use(
      http.post(apiUrl('/decks'), () =>
        HttpResponse.json(
          {
            issues: [{ code: 'required', path: ['title'] }],
            retryable: false,
            status: 422,
            title: 'Validation Failed',
            type: '/problems/validation',
          },
          { status: 422 },
        ),
      ),
    )

    expect(expectErr(await webDeckService.create(draft))).toEqual({
      issues: [{ code: 'required', path: ['title'] }],
      retryable: false,
      type: DomainErrorType.Validation,
    })
  })

  it('maps malformed success responses to service unavailable', async () => {
    server.use(
      http.get(apiUrl('/decks/:deckId'), () =>
        HttpResponse.json({ id: 'not-a-deck' }),
      ),
    )

    expect(expectErr(await webDeckService.getById('world-history'))).toMatchObject({
      message: 'Failed to load deck.',
      retryable: true,
      type: DomainErrorType.Unavailable,
    })
  })
})
