import { describe, expect, it } from 'vitest'

import { newMockApiApp } from './app.ts'

const json = async <T>(response: Response) => response.json() as Promise<T>

describe('mock api app', () => {
  it('creates counter ids and exposes them through the workspace list', async () => {
    const app = await newMockApiApp()

    const createResponse = await app.fetch(
      new Request('http://localhost/api/v1/workspaces', {
        body: JSON.stringify({
          description: 'Temporary research workspace.',
          icon: 'bookmark',
          title: 'Field Notes',
        }),
        headers: {
          'content-type': 'application/json',
        },
        method: 'POST',
      }),
    )

    expect(createResponse.status).toBe(201)
    await expect(json<{ id: string; title: string }>(createResponse)).resolves.toMatchObject({
      id: 'workspace-1',
      title: 'Field Notes',
    })

    const listResponse = await app.fetch(new Request('http://localhost/api/v1/workspaces'))
    expect(listResponse.status).toBe(200)
    await expect(
      json<{ workspaces: Array<{ id: string }> }>(listResponse),
    ).resolves.toMatchObject({
      workspaces: expect.arrayContaining([expect.objectContaining({ id: 'workspace-1' })]),
    })
  })

  it('mounts the product routes under a custom base path', async () => {
    const app = await newMockApiApp({ basePath: '/custom' })

    const response = await app.fetch(new Request('http://localhost/custom/workspaces'))
    expect(response.status).toBe(200)
    await expect(
      json<{ activeWorkspaceId: string | null }>(response),
    ).resolves.toMatchObject({
      activeWorkspaceId: 'independent-study',
    })
  })

  it('keeps seeded deck stats aligned with seeded notes', async () => {
    const app = await newMockApiApp()

    const response = await app.fetch(new Request('http://localhost/__mock/state'))

    expect(response.status).toBe(200)
    await expect(
      json<{ decks: Array<{ dueToday: number; id: string; progress: number; totalNotes: number }> }>(response),
    ).resolves.toEqual(
      expect.objectContaining({
        decks: expect.arrayContaining([
          expect.objectContaining({ id: 'cognitive-biases', dueToday: 3, progress: 62, totalNotes: 3 }),
          expect.objectContaining({ id: 'world-history', dueToday: 1, progress: 66, totalNotes: 2 }),
          expect.objectContaining({ id: 'political-thought', dueToday: 2, progress: 54, totalNotes: 3 }),
          expect.objectContaining({ id: 'statistics-basics', dueToday: 1, progress: 51, totalNotes: 1 }),
        ]),
      }),
    )
  })

  it('exposes admin state reset and inspection endpoints', async () => {
    const app = await newMockApiApp()

    const createResponse = await app.fetch(
      new Request('http://localhost/api/v1/workspaces', {
        body: JSON.stringify({
          description: 'Temporary research workspace.',
          icon: 'bookmark',
          title: 'Field Notes',
        }),
        headers: {
          'content-type': 'application/json',
        },
        method: 'POST',
      }),
    )
    expect(createResponse.status).toBe(201)

    const resetResponse = await app.fetch(new Request('http://localhost/__mock/reset', { method: 'POST' }))
    expect(resetResponse.status).toBe(200)

    const stateResponse = await app.fetch(new Request('http://localhost/__mock/state'))
    expect(stateResponse.status).toBe(200)

    const state = await json<{
      activeWorkspace: { workspaceId: string }
      workspaces: Array<{ id: string }>
    }>(stateResponse)

    expect(state.activeWorkspace.workspaceId).toBe('independent-study')
    expect(state.workspaces).not.toEqual(expect.arrayContaining([expect.objectContaining({ id: 'workspace-1' })]))
  })
})
