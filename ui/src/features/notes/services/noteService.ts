import type { DomainResult } from '@shared/errors'
import type { SortPreference } from '@shared/types/sort.types'

import type { NoteDetail, NoteDraft, NoteListItem, NoteRef } from '../types/note.types'

export interface NoteService {
  create(draft: NoteDraft): DomainResult<NoteRef>
  delete(noteId: string): DomainResult<void>
  getById(deckId: string, noteId: string): DomainResult<NoteDetail>
  listByDeck(deckId: string, sort?: SortPreference): DomainResult<NoteListItem[]>
  update(noteId: string, draft: NoteDraft): DomainResult<NoteRef>
}
