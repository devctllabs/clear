import type { DomainResult } from '@shared/errors'

import type {
  Deck,
  DeckDetail,
  DeckDraft,
  DeckSortPreference,
} from '../types/deck.types'

export interface DeckService {
  create(draft: DeckDraft): DomainResult<Deck>
  delete(deckId: string): DomainResult<void>
  getById(deckId: string): DomainResult<DeckDetail>
  listFolderChildren(folderId: string, sort?: DeckSortPreference): DomainResult<Deck[]>
  listWorkspaceRoot(workspaceId: string, sort?: DeckSortPreference): DomainResult<Deck[]>
  update(deckId: string, draft: DeckDraft): DomainResult<DeckDetail>
}
