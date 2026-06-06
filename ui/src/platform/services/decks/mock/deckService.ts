import type { DeckService } from '@features/decks/services/deckService'
import type { Deck, DeckDetail, DeckDraft } from '@features/decks/types/deck.types'
import { mockApi } from '@platform/mock/mockApi'
import { toMockDomainResult, toMockVoidDomainResult } from '@platform/mock/mockDomainResult'
import { toSortQuery } from '@shared/services/api/adapters/sortQuery'

export const mockDeckService: DeckService = {
  async create(draft) {
    return toMockDomainResult(
      () => mockApi.decksService.createDeck(toDeckDraft(draft)),
      toDeck,
    )
  },
  async delete(deckId) {
    return toMockVoidDomainResult(() => mockApi.decksService.deleteDeck(deckId))
  },
  async getById(deckId) {
    return toMockDomainResult(
      () => mockApi.decksService.getDeck(deckId),
      toDeckDetail,
    )
  },
  async listFolderChildren(folderId, sort) {
    return toMockDomainResult(
      () => mockApi.decksService.listFolderDecks(folderId, toSortQuery(sort)),
      (decks) => decks.map(toDeck),
    )
  },
  async listWorkspaceRoot(workspaceId, sort) {
    return toMockDomainResult(
      () => mockApi.decksService.listWorkspaceDecks(workspaceId, toSortQuery(sort)),
      (decks) => decks.map(toDeck),
    )
  },
  async update(deckId, draft) {
    return toMockDomainResult(
      () => mockApi.decksService.updateDeck(deckId, toDeckDraft(draft)),
      toDeckDetail,
    )
  },
}

const toDeck = (deck: unknown): Deck => deck as Deck

const toDeckDetail = (deck: unknown): DeckDetail => deck as DeckDetail

const toDeckDraft = (draft: DeckDraft) => draft
