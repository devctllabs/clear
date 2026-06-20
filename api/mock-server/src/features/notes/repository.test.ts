import { describe, expect, it } from 'vitest'

import { newMemoryMockStateStore } from '../../lib/stateStore.ts'
import { NotesRepository } from './repository.ts'

describe('NotesRepository', () => {
  it('sorts deck notes by due date', async () => {
    const notes = new NotesRepository(await newMemoryMockStateStore())

    expect(
      notes
        .listByDeck('world-history', {
          sortDirection: 'asc',
          sortField: 'dueAt',
        })
        .map((note) => note.id),
    ).toEqual(['industrial-revolution-causes', 'postwar-institutions'])

    expect(
      notes
        .listByDeck('world-history', {
          sortDirection: 'desc',
          sortField: 'dueAt',
        })
      .map((note) => note.id),
    ).toEqual(['postwar-institutions', 'industrial-revolution-causes'])
  })

  it('sorts deck notes by progress', async () => {
    const notes = new NotesRepository(await newMemoryMockStateStore())

    expect(
      notes
        .listByDeck('world-history', {
          sortDirection: 'asc',
          sortField: 'progress',
        })
        .map((note) => note.id),
    ).toEqual(['postwar-institutions', 'industrial-revolution-causes'])

    expect(
      notes
        .listByDeck('world-history', {
          sortDirection: 'desc',
          sortField: 'progress',
        })
        .map((note) => note.id),
    ).toEqual(['industrial-revolution-causes', 'postwar-institutions'])
  })
})
