import type { NoteService } from '@features/notes/services/noteService'
import { domainError, err, ok } from '@shared/errors'
import { mockAppDataStore } from '@platform/mock/mockAppDataStore'

export const mockNoteService: NoteService = {
  async create(draft) {
    return ok(mockAppDataStore.createNote(draft))
  },
  async delete(noteId) {
    mockAppDataStore.deleteNote(noteId)

    return ok(undefined)
  },
  async getById(deckId, noteId) {
    const note = mockAppDataStore.getNoteById(deckId, noteId)

    return note ? ok(note) : err(domainError.notFound('Note not found.', 'note', noteId))
  },
  async listByDeck(deckId, sort) {
    return ok(mockAppDataStore.listNotes(deckId, sort))
  },
  async update(noteId, draft) {
    const note = mockAppDataStore.updateNote(noteId, draft)

    return note ? ok(note) : err(domainError.notFound('Note not found.', 'note', noteId))
  },
}
