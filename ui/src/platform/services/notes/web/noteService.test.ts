import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'

import type {
  NoteDetail,
  NoteDraft,
  NoteListItem,
  NoteRef,
} from '@api-generated/clear-api'
import { apiUrl, expectOk, setupWebApiMsw } from '@/test/web-api-msw'

import { webNoteService } from './noteService'

const server = setupWebApiMsw()

const noteListItem = {
  dueAt: '2026-05-16T12:00:00.000Z',
  id: 'industrial-revolution-causes',
  kind: 'basic',
  progress: 74,
  reviewedAt: '2026-05-12T12:00:00.000Z',
  status: 'mastered',
  title: 'Industrial Revolution Causes',
  updatedAt: '2026-05-12T12:00:00.000Z',
} satisfies NoteListItem

const noteDetail = {
  deckId: 'world-history',
  dueAt: noteListItem.dueAt,
  editor: { back: 'Back', front: 'Front' },
  id: noteListItem.id,
  kind: 'basic',
  progress: noteListItem.progress,
  reviewedAt: noteListItem.reviewedAt,
  status: noteListItem.status,
  title: noteListItem.title,
  updatedAt: noteListItem.updatedAt,
} satisfies NoteDetail

const noteRef = {
  deckId: 'world-history',
  id: noteListItem.id,
} satisfies NoteRef

const draft = {
  deckId: 'world-history',
  editor: { back: 'Updated back', front: 'Updated front' },
  kind: 'basic',
  title: 'Updated Industrial Revolution Causes',
} satisfies NoteDraft

describe('webNoteService', () => {
  it('creates notes through the web API and returns a slim note ref', async () => {
    server.use(
      http.post(apiUrl('/notes'), async ({ request }) => {
        expect(await request.json()).toEqual(draft)

        return HttpResponse.json(noteRef, { status: 201 })
      }),
    )

    const result = expectOk(await webNoteService.create(draft))

    expect(result).toEqual(noteRef)
    expect(result).not.toHaveProperty('editor')
    expect(result).not.toHaveProperty('progress')
  })

  it('moves notes to trash through the web API', async () => {
    server.use(
      http.delete(apiUrl('/notes/:noteId'), ({ params }) => {
        expect(params.noteId).toBe(noteListItem.id)

        return new HttpResponse(null, { status: 204 })
      }),
    )

    expectOk(await webNoteService.delete(noteListItem.id))
  })

  it('loads note detail by note id through the web API', async () => {
    server.use(
      http.get(apiUrl('/notes/:noteId'), ({ params }) => {
        expect(params.noteId).toBe(noteListItem.id)

        return HttpResponse.json(noteDetail)
      }),
    )

    await expect(
      webNoteService.getById('ignored-by-web-service', noteListItem.id),
    ).resolves.toEqual({
      ok: true,
      value: noteDetail,
    })
  })

  it('lists deck notes with sort query params and slim list items', async () => {
    server.use(
      http.get(apiUrl('/decks/:deckId/notes'), ({ params, request }) => {
        const url = new URL(request.url)

        expect(params.deckId).toBe('world-history')
        expect(url.searchParams.get('sortDirection')).toBe('desc')
        expect(url.searchParams.get('sortField')).toBe('progress')

        return HttpResponse.json([noteListItem])
      }),
    )

    const result = expectOk(
      await webNoteService.listByDeck('world-history', {
        direction: 'desc',
        field: 'progress',
      }),
    )

    expect(result).toEqual([noteListItem])
    expect(result[0]).not.toHaveProperty('editor')
    expect(result[0]).not.toHaveProperty('bodySegments')
    expect(result[0]).not.toHaveProperty('cards')
  })

  it('updates notes through the web API and returns a slim note ref', async () => {
    server.use(
      http.put(apiUrl('/notes/:noteId'), async ({ params, request }) => {
        expect(params.noteId).toBe(noteListItem.id)
        expect(await request.json()).toEqual(draft)

        return HttpResponse.json(noteRef)
      }),
    )

    const result = expectOk(await webNoteService.update(noteListItem.id, draft))

    expect(result).toEqual(noteRef)
    expect(result).not.toHaveProperty('editor')
    expect(result).not.toHaveProperty('progress')
  })
})
