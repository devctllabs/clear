import type { DomainResult } from '@shared/errors'
import type { SortPreference } from '@shared/types/sort.types'

import type { Deck, DeckDetail, DeckDraft } from '../types/deck.types'

export interface DeckService {
  create(draft: DeckDraft): DomainResult<Deck>
  delete(deckId: string): DomainResult<void>
  getById(deckId: string): DomainResult<DeckDetail>
  listFolderChildren(folderId: string, sort?: SortPreference): DomainResult<Deck[]>
  listWorkspaceRoot(workspaceId: string, sort?: SortPreference): DomainResult<Deck[]>
  update(deckId: string, draft: DeckDraft): DomainResult<DeckDetail>
}
