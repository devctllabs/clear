import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiMocks = vi.hoisted(() => ({
  createDeck: vi.fn(),
  deleteDeck: vi.fn(),
  getDeck: vi.fn(),
  listFolderDecks: vi.fn(),
  listWorkspaceDecks: vi.fn(),
  updateDeck: vi.fn(),
}))

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
}

const loadWebDeckService = async () => {
  vi.doMock('@api-generated/clear-api', () => apiMocks)

  return (await import('./deckService')).webDeckService
}

describe('webDeckService', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('uses the workspace endpoint for root decks', async () => {
    apiMocks.listWorkspaceDecks.mockResolvedValue({ data: [deck] })
    const webDeckService = await loadWebDeckService()

    const result = await webDeckService.listWorkspaceRoot('independent-study', {
      direction: 'desc',
      field: 'updated',
    })

    expect(result.ok ? result.value : []).toEqual([deck])
    expect(apiMocks.listWorkspaceDecks).toHaveBeenCalledWith({
      path: { workspaceId: 'independent-study' },
      query: { sortDirection: 'desc', sortField: 'updated' },
    })
    expect(apiMocks.listFolderDecks).not.toHaveBeenCalled()
  })

  it('uses the folder endpoint for folder decks', async () => {
    apiMocks.listFolderDecks.mockResolvedValue({ data: [deck] })
    const webDeckService = await loadWebDeckService()

    const result = await webDeckService.listFolderChildren('reading-notes')

    expect(result.ok ? result.value : []).toEqual([deck])
    expect(apiMocks.listFolderDecks).toHaveBeenCalledWith({
      path: { folderId: 'reading-notes' },
      query: {},
    })
    expect(apiMocks.listWorkspaceDecks).not.toHaveBeenCalled()
  })
})
