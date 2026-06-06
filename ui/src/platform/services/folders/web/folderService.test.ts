import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'

import type { Folder, FolderDraft } from '@api-generated/clear-api'
import { apiUrl, expectOk, setupWebApiMsw } from '@/test/web-api-msw'

import { webFolderService } from './folderService'

const server = setupWebApiMsw()

const folder = {
  description: 'Reference materials.',
  id: 'reading-notes',
  name: 'Reading Notes',
  parentId: 'independent-study',
  updatedAt: '2026-05-15T12:00:00.000Z',
  workspaceId: 'independent-study',
} satisfies Folder

const draft = {
  description: 'Updated reference materials.',
  name: 'Reading Notes Updated',
  parentId: 'independent-study',
} satisfies FolderDraft

describe('webFolderService', () => {
  it('creates folders through the web API', async () => {
    server.use(
      http.post(apiUrl('/folders'), async ({ request }) => {
        expect(await request.json()).toEqual(draft)

        return HttpResponse.json(folder, { status: 201 })
      }),
    )

    await expect(webFolderService.create(draft)).resolves.toEqual({
      ok: true,
      value: folder,
    })
  })

  it('moves folders to trash through the web API', async () => {
    server.use(
      http.delete(apiUrl('/folders/:folderId'), ({ params }) => {
        expect(params.folderId).toBe('reading-notes')

        return new HttpResponse(null, { status: 204 })
      }),
    )

    expectOk(await webFolderService.delete('reading-notes'))
  })

  it('loads a folder by id through the web API', async () => {
    server.use(
      http.get(apiUrl('/folders/:folderId'), ({ params }) => {
        expect(params.folderId).toBe('reading-notes')

        return HttpResponse.json(folder)
      }),
    )

    await expect(webFolderService.getById('reading-notes')).resolves.toEqual({
      ok: true,
      value: folder,
    })
  })

  it('maps folder path response segments', async () => {
    server.use(
      http.get(apiUrl('/folders/:folderId/path'), ({ params }) => {
        expect(params.folderId).toBe('history')

        return HttpResponse.json({ segments: ['Reading Notes', 'History'] })
      }),
    )

    await expect(webFolderService.getPath('history')).resolves.toEqual({
      ok: true,
      value: ['Reading Notes', 'History'],
    })
  })

  it('lists nested folders with sort query params', async () => {
    server.use(
      http.get(apiUrl('/folders/:folderId/folders'), ({ params, request }) => {
        const url = new URL(request.url)

        expect(params.folderId).toBe('reading-notes')
        expect(url.searchParams.get('sortDirection')).toBe('desc')
        expect(url.searchParams.get('sortField')).toBe('updated')

        return HttpResponse.json([folder])
      }),
    )

    await expect(
      webFolderService.listFolderChildren('reading-notes', {
        direction: 'desc',
        field: 'updated',
      }),
    ).resolves.toEqual({
      ok: true,
      value: [folder],
    })
  })

  it('lists workspace root folders with sort query params', async () => {
    server.use(
      http.get(apiUrl('/workspaces/:workspaceId/folders'), ({ params, request }) => {
        const url = new URL(request.url)

        expect(params.workspaceId).toBe('independent-study')
        expect(url.searchParams.get('sortDirection')).toBe('asc')
        expect(url.searchParams.get('sortField')).toBe('title')

        return HttpResponse.json([folder])
      }),
    )

    await expect(
      webFolderService.listWorkspaceRoot('independent-study', {
        direction: 'asc',
        field: 'title',
      }),
    ).resolves.toEqual({
      ok: true,
      value: [folder],
    })
  })

  it('updates folders through the web API', async () => {
    server.use(
      http.put(apiUrl('/folders/:folderId'), async ({ params, request }) => {
        expect(params.folderId).toBe('reading-notes')
        expect(await request.json()).toEqual(draft)

        return HttpResponse.json({ ...folder, ...draft })
      }),
    )

    await expect(webFolderService.update('reading-notes', draft)).resolves.toEqual({
      ok: true,
      value: { ...folder, ...draft },
    })
  })
})
