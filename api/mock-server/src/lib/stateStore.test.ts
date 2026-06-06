import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { tmpdir } from 'node:os'

import { afterEach, describe, expect, it } from 'vitest'

import { seedState } from '../generated/mock-admin/state/seed.ts'
import { newFileMockStateStore } from './nodeStateStore.ts'
import { newMemoryMockStateStore } from './stateStore.ts'

const tempRoots: string[] = []

const newTempStateFile = () => {
  const root = mkdtempSync(path.join(tmpdir(), 'clear-mock-state-'))
  tempRoots.push(root)

  return path.join(root, 'db.json')
}

describe('MswDataStateStore', () => {
  afterEach(() => {
    for (const root of tempRoots.splice(0)) {
      rmSync(root, { force: true, recursive: true })
    }
  })

  it('hydrates seed records and preserves snapshot order', async () => {
    const store = await newMemoryMockStateStore()

    expect(store.snapshot().workspaces.map((workspace) => workspace.id)).toEqual([
      'independent-study',
      'reading-archive',
    ])
    expect(store.snapshot().folders.map((folder) => folder.id)).toEqual([
      'reading-notes',
      'reference',
      'history',
    ])
  })

  it('creates, updates, and deletes entity records through data collections', async () => {
    const store = await newMemoryMockStateStore()

    await store.transaction(async () => {
      await store.createEntity('workspaces', {
        description: 'Draft workspace.',
        icon: 'layers-3',
        id: 'draft-workspace',
        title: 'Draft Workspace',
        updatedAt: store.now(),
      }, { prepend: true })
      await store.updateEntity('workspaces', 'draft-workspace', (workspace) => ({
        ...workspace,
        title: 'Updated Workspace',
      }))
    })

    expect(store.snapshot().workspaces[0]).toMatchObject({
      id: 'draft-workspace',
      title: 'Updated Workspace',
    })

    await store.deleteEntity('workspaces', 'draft-workspace')

    expect(store.snapshot().workspaces.map((workspace) => workspace.id)).not.toContain('draft-workspace')
  })

  it('resets, replaces state, and updates clock snapshots', async () => {
    const store = await newMemoryMockStateStore()
    const state = seedState()

    await store.setClock('2026-06-01T00:00:00.000Z')
    expect(store.snapshot().clock.now).toBe('2026-06-01T00:00:00.000Z')

    await store.replace({
      ...state,
      workspaces: [],
    })
    expect(store.snapshot().workspaces).toEqual([])

    await store.reset()
    expect(store.snapshot().workspaces).toHaveLength(state.workspaces.length)
  })

  it('persists and reloads a file-backed snapshot', async () => {
    const stateFile = newTempStateFile()
    const first = await newFileMockStateStore({ stateFile })

    await first.transaction(async () => {
      await first.createEntity('workspaces', {
        description: 'Persisted workspace.',
        icon: 'layers-3',
        id: 'persisted-workspace',
        title: 'Persisted Workspace',
        updatedAt: first.now(),
      }, { prepend: true })
    })

    const second = await newFileMockStateStore({ stateFile })

    expect(second.snapshot().workspaces[0]).toMatchObject({
      id: 'persisted-workspace',
    })

    writeFileSync(stateFile, '{broken', 'utf8')

    const repaired = await newFileMockStateStore({ stateFile })

    expect(repaired.snapshot().workspaces.map((workspace) => workspace.id)).toContain('independent-study')
  })
})
