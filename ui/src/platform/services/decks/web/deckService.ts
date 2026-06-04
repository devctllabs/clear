import {
  createDeck as apiCreateDeck,
  deleteDeck as apiDeleteDeck,
  getDeck as apiGetDeck,
  listFolderDecks as apiListFolderDecks,
  listWorkspaceDecks as apiListWorkspaceDecks,
  updateDeck as apiUpdateDeck,
} from '@api-generated/clear-api'
import type {
  Deck as ApiDeck,
  DeckDraft as ApiDeckDraft,
} from '@api-generated/clear-api'

import type { DeckService } from '@features/decks/services/deckService'
import type { Deck, DeckDetail, DeckDraft } from '@features/decks/types/deck.types'
import { toSortQuery } from '@shared/services/api/adapters/sortQuery'
import {
  toDomainResult,
  toVoidDomainResult,
} from '@shared/services/api/sdk-result'

export const webDeckService: DeckService = {
  create(draft) {
    return toDomainResult(
      apiCreateDeck({ body: toDeckDraft(draft) }),
      toDeck,
      'Failed to create deck.',
    )
  },
  delete(deckId) {
    return toVoidDomainResult(
      apiDeleteDeck({ path: { deckId } }),
      'Failed to delete deck.',
    )
  },
  getById(deckId) {
    return toDomainResult(
      apiGetDeck({ path: { deckId } }),
      toDeckDetail,
      'Failed to load deck.',
    )
  },
  listFolderChildren(folderId, sort) {
    const query = toSortQuery(sort)

    return toDomainResult(
      apiListFolderDecks({ path: { folderId }, query }),
      (decks) => decks.map(toDeck),
      'Failed to load decks.',
    )
  },
  listWorkspaceRoot(workspaceId, sort) {
    const query = toSortQuery(sort)

    return toDomainResult(
      apiListWorkspaceDecks({ path: { workspaceId }, query }),
      (decks) => decks.map(toDeck),
      'Failed to load decks.',
    )
  },
  update(deckId, draft) {
    return toDomainResult(
      apiUpdateDeck({
        body: toDeckDraft(draft),
        path: { deckId },
      }),
      toDeckDetail,
      'Failed to update deck.',
    )
  },
}

const toDeck = (deck: ApiDeck): Deck => deck as Deck

const toDeckDetail = (deck: ApiDeck): DeckDetail => deck as DeckDetail

const toDeckDraft = (draft: DeckDraft): ApiDeckDraft => draft as ApiDeckDraft
