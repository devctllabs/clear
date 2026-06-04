import type { NoteDetailRecord } from '../../generated/mock-admin/contract/index.ts'
import { notFound } from '../../generated/clear-web-api/mock-runtime.ts'
import type { MockStateRepository } from '../../generated/mock-admin/state/repository.ts'
import { visible } from '../../lib/softDelete.ts'
import { byStringField } from '../../lib/sort.ts'

type SortDirection = 'asc' | 'desc'
type NoteSortField = 'title' | 'updated'

const sortNotes = (
  notes: NoteDetailRecord[],
  sortField?: NoteSortField,
  sortDirection: SortDirection = 'asc',
) => {
  if (!sortField) {
    return notes
  }

  const direction = sortDirection === 'desc' ? -1 : 1

  return [...notes].sort((left, right) => {
    if (sortField === 'updated') {
      return left.updatedAt.localeCompare(right.updatedAt) * direction
    }

    return byStringField<NoteDetailRecord>('title', sortDirection)(left, right)
  })
}

export class NotesRepository {
  constructor(private readonly stateStore: MockStateRepository) {}

  all() {
    return this.stateStore.getSlice('notes')
  }

  visible() {
    return visible(this.all())
  }

  find(noteId: string) {
    return this.all().find((note) => note.id === noteId)
  }

  require(noteId: string, options: { includeDeleted?: boolean } = {}) {
    const candidates = options.includeDeleted ? this.all() : this.visible()
    const note = candidates.find((candidate) => candidate.id === noteId)

    if (!note) {
      throw notFound('note', noteId)
    }

    return note
  }

  create(note: NoteDetailRecord) {
    this.stateStore.setSlice('notes', [note, ...this.all()])
    return note
  }

  update(noteId: string, updater: (note: NoteDetailRecord) => NoteDetailRecord) {
    let next: NoteDetailRecord | undefined

    this.stateStore.setSlice('notes', this.all().map((note) => {
      if (note.id !== noteId) {
        return note
      }

      next = updater(note)

      return next
    }))

    return next ?? this.require(noteId, { includeDeleted: true })
  }

  touch(noteId: string, updatedAt: string) {
    return this.update(noteId, (note) => ({ ...note, updatedAt }))
  }

  markDeleted(noteId: string, deletedAt: string) {
    return this.update(noteId, (note) => ({ ...note, deletedAt }))
  }

  restore(noteId: string) {
    return this.update(noteId, (note) => {
      const { deletedAt: _deletedAt, ...restored } = note
      return restored
    })
  }

  remove(noteId: string) {
    const existing = this.find(noteId)

    if (!existing) {
      return undefined
    }

    this.stateStore.setSlice('notes', this.all().filter((note) => note.id !== noteId))

    return existing
  }

  listByDeck(deckId: string, options: { sortField?: NoteSortField; sortDirection?: SortDirection } = {}) {
    const notes = this.visible().filter((note) => note.deckId === deckId)

    return sortNotes(notes, options.sortField, options.sortDirection)
  }
}
