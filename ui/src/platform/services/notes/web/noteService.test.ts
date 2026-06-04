import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiMocks = vi.hoisted(() => ({
  createNote: vi.fn(),
  deleteNote: vi.fn(),
  getNote: vi.fn(),
  listNotesByDeck: vi.fn(),
  updateNote: vi.fn(),
}))

const note = {
  deckId: 'world-history',
  dueAt: '2026-05-16T12:00:00.000Z',
  id: 'industrial-revolution-causes',
  kind: 'basic',
  progress: 74,
  reviewedAt: '2026-05-12T12:00:00.000Z',
  status: 'mastered',
  title: 'Industrial Revolution Causes',
  updatedAt: '2026-05-12T12:00:00.000Z',
}

const noteRef = {
  deckId: note.deckId,
  id: note.id,
}

const loadWebNoteService = async () => {
  vi.doMock('@api-generated/clear-api', () => apiMocks)

  return (await import('./noteService')).webNoteService
}

describe('webNoteService', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('lists deck notes with the slim list item response', async () => {
    apiMocks.listNotesByDeck.mockResolvedValue({ data: [note] })
    const webNoteService = await loadWebNoteService()

    const result = await webNoteService.listByDeck('world-history', {
      direction: 'desc',
      field: 'updated',
    })

    expect(result.ok ? result.value : []).toEqual([note])
    expect(result.ok ? result.value[0] : undefined).not.toHaveProperty('editor')
    expect(result.ok ? result.value[0] : undefined).not.toHaveProperty('bodySegments')
    expect(result.ok ? result.value[0] : undefined).not.toHaveProperty('cards')
    expect(apiMocks.listNotesByDeck).toHaveBeenCalledWith({
      path: { deckId: 'world-history' },
      query: { sortDirection: 'desc', sortField: 'updated' },
    })
  })

  it('creates notes with the slim note ref response', async () => {
    apiMocks.createNote.mockResolvedValue({ data: noteRef })
    const webNoteService = await loadWebNoteService()
    const draft = {
      deckId: 'world-history',
      editor: { back: 'Back', front: 'Front' },
      kind: 'basic' as const,
      title: 'Industrial Revolution Causes',
    }

    const result = await webNoteService.create(draft)

    expect(result.ok ? result.value : undefined).toEqual(noteRef)
    expect(result.ok ? result.value : undefined).not.toHaveProperty('editor')
    expect(result.ok ? result.value : undefined).not.toHaveProperty('progress')
    expect(apiMocks.createNote).toHaveBeenCalledWith({ body: draft })
  })

  it('updates notes with the slim note ref response', async () => {
    apiMocks.updateNote.mockResolvedValue({ data: noteRef })
    const webNoteService = await loadWebNoteService()
    const draft = {
      deckId: 'world-history',
      editor: { back: 'Updated back', front: 'Updated front' },
      kind: 'basic' as const,
      title: 'Updated Industrial Revolution Causes',
    }

    const result = await webNoteService.update(note.id, draft)

    expect(result.ok ? result.value : undefined).toEqual(noteRef)
    expect(result.ok ? result.value : undefined).not.toHaveProperty('editor')
    expect(result.ok ? result.value : undefined).not.toHaveProperty('progress')
    expect(apiMocks.updateNote).toHaveBeenCalledWith({
      body: draft,
      path: { noteId: note.id },
    })
  })
})
