import type { NoteDetailRecord } from '../../generated/mock-admin/contract/index.ts'
import { notFound } from '../../generated/clear-web-api/mock-runtime.ts'
import type { MockStateStore } from '../../lib/stateStore.ts'
import { visible } from '../../lib/softDelete.ts'
import { byStringField } from '../../lib/sort.ts'

type SortDirection = 'asc' | 'desc'
type NoteSortField = 'dueAt' | 'progress' | 'title' | 'updatedAt'

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
    if (sortField === 'dueAt') {
      return (new Date(left.dueAt).getTime() - new Date(right.dueAt).getTime()) * direction
    }

    if (sortField === 'progress') {
      return (left.progress - right.progress) * direction
    }

    if (sortField === 'updatedAt') {
      return left.updatedAt.localeCompare(right.updatedAt) * direction
    }

    return byStringField<NoteDetailRecord>('title', sortDirection)(left, right)
  })
}

export class NotesRepository {
  private readonly stateStore: MockStateStore

  constructor(stateStore: MockStateStore) {
    this.stateStore = stateStore
  }

  all() {
    return this.stateStore.findEntities('notes')
  }

  visible() {
    return visible(this.all())
  }

  find(noteId: string) {
    return this.stateStore.findEntity('notes', noteId)
  }

  require(noteId: string, options: { includeDeleted?: boolean } = {}) {
    const candidates = options.includeDeleted ? this.all() : this.visible()
    const note = candidates.find((candidate) => candidate.id === noteId)

    if (!note) {
      throw notFound('note', noteId)
    }

    return note
  }

  async create(note: NoteDetailRecord) {
    return this.stateStore.createEntity('notes', note, { prepend: true })
  }

  async update(noteId: string, updater: (note: NoteDetailRecord) => NoteDetailRecord) {
    return (
      await this.stateStore.updateEntity('notes', noteId, updater)
    ) ?? this.require(noteId, { includeDeleted: true })
  }

  async touch(noteId: string, updatedAt: string) {
    return this.update(noteId, (note) => ({ ...note, updatedAt }))
  }

  async markDeleted(noteId: string, deletedAt: string) {
    return this.update(noteId, (note) => ({ ...note, deletedAt }))
  }

  async restore(noteId: string) {
    return this.update(noteId, (note) => {
      const { deletedAt: _deletedAt, ...restored } = note
      return restored
    })
  }

  async remove(noteId: string) {
    return this.stateStore.deleteEntity('notes', noteId)
  }

  listByDeck(deckId: string, options: { sortField?: NoteSortField; sortDirection?: SortDirection } = {}) {
    const notes = this.visible().filter((note) => note.deckId === deckId)

    return sortNotes(notes, options.sortField, options.sortDirection)
  }
}
