import type { DeckService } from '@features/decks/services/deckService'
import { domainError, err, ok } from '@shared/errors'
import { mockAppDataStore } from '@platform/mock/mockAppDataStore'

export const mockDeckService: DeckService = {
  async create(draft) {
    return ok(mockAppDataStore.createDeck(draft))
  },
  async delete(deckId) {
    mockAppDataStore.deleteDeck(deckId)

    return ok(undefined)
  },
  async getById(deckId) {
    const deck = mockAppDataStore.getDeckById(deckId)

    return deck ? ok(deck) : err(domainError.notFound('Deck not found.', 'deck', deckId))
  },
  async listFolderChildren(folderId, sort) {
    return ok(mockAppDataStore.listDecksInFolder(folderId, sort))
  },
  async listWorkspaceRoot(workspaceId, sort) {
    return ok(mockAppDataStore.listWorkspaceDecks(workspaceId, sort))
  },
  async update(deckId, draft) {
    const deck = mockAppDataStore.updateDeck(deckId, draft)

    return deck ? ok(deck) : err(domainError.notFound('Deck not found.', 'deck', deckId))
  },
}
