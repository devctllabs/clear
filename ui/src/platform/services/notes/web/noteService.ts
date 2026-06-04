import {
  createNote as apiCreateNote,
  deleteNote as apiDeleteNote,
  getNote as apiGetNote,
  listNotesByDeck as apiListNotesByDeck,
  updateNote as apiUpdateNote,
} from '@api-generated/clear-api'
import type {
  NoteDetail as ApiNoteDetail,
  NoteDraft as ApiNoteDraft,
  NoteListItem as ApiNoteListItem,
  NoteRef as ApiNoteRef,
  NoteSortField as ApiNoteSortField,
} from '@api-generated/clear-api'

import type { NoteService } from '@features/notes/services/noteService'
import type {
  NoteDetail,
  NoteDraft,
  NoteListItem,
  NoteRef,
} from '@features/notes/types/note.types'
import { toSortQuery } from '@shared/services/api/adapters/sortQuery'
import {
  toDomainResult,
  toVoidDomainResult,
} from '@shared/services/api/sdk-result'

export const webNoteService: NoteService = {
  create(draft) {
    return toDomainResult(
      apiCreateNote({ body: toNoteDraft(draft) }),
      toNoteRef,
      'Failed to create note.',
    )
  },
  delete(noteId) {
    return toVoidDomainResult(
      apiDeleteNote({ path: { noteId } }),
      'Failed to delete note.',
    )
  },
  getById(_deckId, noteId) {
    return toDomainResult(
      apiGetNote({ path: { noteId } }),
      toNoteDetail,
      'Failed to load note.',
    )
  },
  listByDeck(deckId, sort) {
    const query = toSortQuery(sort) as {
      sortDirection?: 'asc' | 'desc'
      sortField?: ApiNoteSortField
    }

    return toDomainResult(
      apiListNotesByDeck({
        path: { deckId },
        query,
      }),
      (notes) => notes.map(toNoteListItem),
      'Failed to load notes.',
    )
  },
  update(noteId, draft) {
    return toDomainResult(
      apiUpdateNote({
        body: toNoteDraft(draft),
        path: { noteId },
      }),
      toNoteRef,
      'Failed to update note.',
    )
  },
}

const toNoteDetail = (note: ApiNoteDetail): NoteDetail => note

const toNoteListItem = (note: ApiNoteListItem): NoteListItem => note

const toNoteRef = (note: ApiNoteRef): NoteRef => note

const toNoteDraft = (draft: NoteDraft): ApiNoteDraft => draft
