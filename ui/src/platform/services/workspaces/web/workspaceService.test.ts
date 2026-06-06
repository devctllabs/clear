import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'

import type {
  Workspace,
  WorkspaceDraft,
  WorkspaceListResult,
} from '@api-generated/clear-api'
import { apiUrl, expectOk, setupWebApiMsw } from '@/test/web-api-msw'

import { webWorkspaceService } from './workspaceService'

const server = setupWebApiMsw()

const workspace = {
  description: 'Independent study workspace.',
  icon: 'brain',
  id: 'independent-study',
  title: 'Independent Study',
  updatedAt: '2026-05-15T12:00:00.000Z',
} satisfies Workspace

const draft = {
  description: 'Updated study workspace.',
  icon: 'brain',
  title: 'Independent Study Updated',
} as const satisfies WorkspaceDraft

const listResult = {
  activeWorkspaceId: workspace.id,
  workspaces: [workspace],
} satisfies WorkspaceListResult

describe('webWorkspaceService', () => {
  it('creates workspaces through the web API', async () => {
    server.use(
      http.post(apiUrl('/workspaces'), async ({ request }) => {
        expect(await request.json()).toEqual(draft)

        return HttpResponse.json(workspace, { status: 201 })
      }),
    )

    await expect(webWorkspaceService.create(draft)).resolves.toEqual({
      ok: true,
      value: workspace,
    })
  })

  it('moves workspaces to trash and maps the next active workspace id', async () => {
    server.use(
      http.delete(apiUrl('/workspaces/:workspaceId'), ({ params }) => {
        expect(params.workspaceId).toBe(workspace.id)

        return HttpResponse.json({ activeWorkspaceId: null })
      }),
    )

    await expect(webWorkspaceService.delete(workspace.id)).resolves.toEqual({
      ok: true,
      value: null,
    })
  })

  it('loads the active workspace id through the web API', async () => {
    server.use(
      http.get(apiUrl('/workspaces/active'), () =>
        HttpResponse.json({ workspaceId: workspace.id }),
      ),
    )

    await expect(webWorkspaceService.getActiveId()).resolves.toEqual({
      ok: true,
      value: workspace.id,
    })
  })

  it('loads a workspace by id through the web API', async () => {
    server.use(
      http.get(apiUrl('/workspaces/:workspaceId'), ({ params }) => {
        expect(params.workspaceId).toBe(workspace.id)

        return HttpResponse.json(workspace)
      }),
    )

    await expect(webWorkspaceService.getById(workspace.id)).resolves.toEqual({
      ok: true,
      value: workspace,
    })
  })

  it('lists workspaces through the web API', async () => {
    server.use(
      http.get(apiUrl('/workspaces'), () => HttpResponse.json(listResult)),
    )

    await expect(webWorkspaceService.list()).resolves.toEqual({
      ok: true,
      value: listResult,
    })
  })

  it('sets the active workspace through the web API', async () => {
    server.use(
      http.put(apiUrl('/workspaces/active'), async ({ request }) => {
        expect(await request.json()).toEqual({ workspaceId: workspace.id })

        return new HttpResponse(null, { status: 204 })
      }),
    )

    expectOk(await webWorkspaceService.setActiveId(workspace.id))
  })

  it('updates workspaces through the web API', async () => {
    server.use(
      http.put(apiUrl('/workspaces/:workspaceId'), async ({ params, request }) => {
        expect(params.workspaceId).toBe(workspace.id)
        expect(await request.json()).toEqual(draft)

        return HttpResponse.json({ ...workspace, ...draft })
      }),
    )

    await expect(webWorkspaceService.update(workspace.id, draft)).resolves.toEqual({
      ok: true,
      value: { ...workspace, ...draft },
    })
  })
})
