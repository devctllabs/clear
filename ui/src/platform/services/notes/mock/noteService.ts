import type { NoteService } from '@features/notes/services/noteService'
import type {
  NoteDetail,
  NoteDraft,
  NoteListItem,
  NoteRef,
} from '@features/notes/types/note.types'
import { mockApi } from '@platform/mock/mockApi'
import { toMockDomainResult, toMockVoidDomainResult } from '@platform/mock/mockDomainResult'
import { toSortQuery } from '@shared/services/api/adapters/sortQuery'

export const mockNoteService: NoteService = {
  async create(draft) {
    return toMockDomainResult(
      () => mockApi.notesService.createNote(toNoteDraft(draft)),
      toNoteRef,
    )
  },
  async delete(noteId) {
    return toMockVoidDomainResult(() => mockApi.notesService.deleteNote(noteId))
  },
  async getById(deckId, noteId) {
    void deckId

    return toMockDomainResult(
      () => mockApi.notesService.getNote(noteId),
      toNoteDetail,
    )
  },
  async listByDeck(deckId, sort) {
    return toMockDomainResult(
      () => mockApi.notesService.listNotesByDeck(deckId, toSortQuery(sort)),
      (notes) => notes.map(toNoteListItem),
    )
  },
  async update(noteId, draft) {
    return toMockDomainResult(
      () => mockApi.notesService.updateNote(noteId, toNoteDraft(draft)),
      toNoteRef,
    )
  },
}

const toNoteDetail = (note: unknown): NoteDetail => note as NoteDetail

const toNoteDraft = (draft: NoteDraft) => draft

const toNoteListItem = (note: unknown): NoteListItem => note as NoteListItem

const toNoteRef = (note: unknown): NoteRef => note as NoteRef
