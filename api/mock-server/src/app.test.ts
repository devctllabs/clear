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

  it('returns validation issue facts for invalid request bodies', async () => {
    const app = await newMockApiApp()

    const response = await app.fetch(
      new Request('http://localhost/api/v1/workspaces', {
        body: JSON.stringify({
          description: 'Temporary research workspace.',
          icon: 'bookmark',
          title: '',
        }),
        headers: {
          'content-type': 'application/json',
        },
        method: 'POST',
      }),
    )

    expect(response.status).toBe(422)
    await expect(json(response)).resolves.toMatchObject({
      issues: [
        {
          code: 'min_length',
          params: {
            min: 1,
            valueType: 'string',
          },
          path: ['title'],
        },
      ],
      retryable: false,
      type: 'validation',
    })
  })

  it.each([
    {
      body: {
        description: 'Temporary research workspace.',
        icon: 'bookmark',
        title: '   ',
      },
      label: 'workspace create title',
      method: 'POST',
      path: '/api/v1/workspaces',
      validationPath: ['title'],
    },
    {
      body: {
        description: 'Updated research workspace.',
        icon: 'bookmark',
        title: '   ',
      },
      label: 'workspace update title',
      method: 'PUT',
      path: '/api/v1/workspaces/independent-study',
      validationPath: ['title'],
    },
    {
      body: {
        description: 'Temporary folder.',
        name: '   ',
        parentId: 'independent-study',
      },
      label: 'folder create name',
      method: 'POST',
      path: '/api/v1/folders',
      validationPath: ['name'],
    },
    {
      body: {
        description: 'Updated folder.',
        name: '   ',
        parentId: 'reading-notes',
      },
      label: 'folder update name',
      method: 'PUT',
      path: '/api/v1/folders/history',
      validationPath: ['name'],
    },
    {
      body: {
        description: 'Temporary deck.',
        icon: 'brain',
        parentId: 'independent-study',
        title: '   ',
      },
      label: 'deck create title',
      method: 'POST',
      path: '/api/v1/decks',
      validationPath: ['title'],
    },
    {
      body: {
        description: 'Updated deck.',
        icon: 'brain',
        parentId: 'independent-study',
        title: '   ',
      },
      label: 'deck update title',
      method: 'PUT',
      path: '/api/v1/decks/world-history',
      validationPath: ['title'],
    },
  ])('rejects blank $label', async ({ body, method, path, validationPath }) => {
    const app = await newMockApiApp()

    const response = await app.fetch(
      new Request(`http://localhost${path}`, {
        body: JSON.stringify(body),
        headers: {
          'content-type': 'application/json',
        },
        method,
      }),
    )

    expect(response.status).toBe(422)
    await expect(json(response)).resolves.toMatchObject({
      issues: [
        {
          code: 'required',
          path: validationPath,
        },
      ],
      retryable: false,
      type: 'validation',
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
