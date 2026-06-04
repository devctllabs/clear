import type {
  NoteDetailRecord,
} from '../../generated/mock-admin/contract/index.ts'
import type {
  NoteDraft,
  NoteListItem,
  NoteRef,
} from '../../generated/clear-web-api/contract/types.gen.ts'
import type { ReviewGrade } from '../../generated/clear-web-api/contract/types.gen.ts'
import { conflict } from '../../generated/clear-web-api/mock-runtime.ts'
import type { MockStateRepository } from '../../generated/mock-admin/state/repository.ts'
import { newIdAllocator } from '../../lib/ids.ts'
import type { DeckRepository } from '../decks/repository.ts'
import { summarizeDeckNotes } from '../decks/stats.ts'
import type { LocationPathResolver } from '../location-path/resolver.ts'
import {
  buildNoteDetail,
  buildReviewCards,
  dueAtForGrade,
  gradeBasicNote,
  gradeClozeCard,
  toNoteListItem,
} from './noteDetails.ts'
import { NotesRepository } from './repository.ts'
import type { TrashRepository } from '../trash/repository.ts'
import type { WorkspaceRepository } from '../workspaces/repository.ts'

export class NotesService {
  constructor(
    private readonly notes: NotesRepository,
    private readonly decks: DeckRepository,
    private readonly workspaces: WorkspaceRepository,
    private readonly trash: TrashRepository,
    private readonly paths: LocationPathResolver,
    private readonly stateStore: MockStateRepository,
  ) {}

  listNotesByDeck(deckId: string, query?: { sortField?: string; sortDirection?: string }): NoteListItem[] {
    const deck = this.decks.require(deckId)
    const sortQuery = query ?? {}
    const sortField = sortQuery.sortField === 'title' || sortQuery.sortField === 'updated' ? sortQuery.sortField : undefined
    const sortDirection = sortQuery.sortDirection === 'desc' ? 'desc' : 'asc'

    return this.notes.listByDeck(deck.id ?? '', { sortField, sortDirection }).map(toNoteListItem)
  }

  createNote(draft: NoteDraft): NoteRef {
    const deck = this.decks.require(draft.deckId)
    const workspaceId = deck.workspaceId

    return this.stateStore.transaction(() => {
      const ids = newIdAllocator(this.stateStore.getSlice('idCounters'))
      const now = this.stateStore.now()
      const noteId = ids.next('note')
      const note = buildNoteDetail(draft, noteId, now, ids)
      const created = this.notes.create(note)

      this.recomputeDeckStats(draft.deckId, workspaceId, now)

      return {
        deckId: created.deckId,
        id: created.id ?? '',
      }
    })
  }

  getNote(noteId: string) {
    return this.notes.require(noteId)
  }

  updateNote(noteId: string, draft: NoteDraft): NoteRef {
    const current = this.notes.require(noteId)
    const currentDeckId = current.deckId
    const currentWorkspaceId = this.decks.require(currentDeckId).workspaceId
    const nextDeck = this.decks.require(draft.deckId)
    const nextWorkspaceId = nextDeck.workspaceId

    return this.stateStore.transaction(() => {
      const ids = newIdAllocator(this.stateStore.getSlice('idCounters'))
      const now = this.stateStore.now()
      const replacement = buildNoteDetail(draft, noteId, now, ids)
      const updated = this.notes.update(noteId, () => ({
        ...replacement,
        id: noteId,
        updatedAt: now,
      }))

      this.recomputeDeckStats(currentDeckId, currentWorkspaceId, now)
      if (currentDeckId !== draft.deckId) {
        this.recomputeDeckStats(draft.deckId, nextWorkspaceId, now)
      }

      return {
        deckId: updated.deckId,
        id: updated.id ?? '',
      }
    })
  }

  deleteNote(noteId: string) {
    const note = this.notes.require(noteId)
    const deck = this.decks.require(note.deckId)

    return this.stateStore.transaction(() => {
      const deletedAt = this.stateStore.now()
      this.notes.markDeleted(noteId, deletedAt)
      this.trash.addItem({
        deletedAt,
        id: note.id ?? '',
        kind: 'note',
        locationPath: this.paths.noteLocationPath(note),
        title: note.title,
      })
      this.recomputeDeckStats(deck.id ?? '', deck.workspaceId, deletedAt)
    })
  }

  toReviewCards(deckId: string) {
    return this.notes.listByDeck(deckId).flatMap((note) => buildReviewCards(note))
  }

  gradeNoteCard(noteId: string, cardId: string, grade: ReviewGrade) {
    const note = this.notes.require(noteId)
    const deck = this.decks.require(note.deckId)
    const now = this.stateStore.now()
    const dueAt = dueAtForGrade(now, grade)

    if (note.kind === 'basic' && cardId !== note.id) {
      throw conflict(`Review card ${cardId} does not belong to note ${noteId}`)
    }

    if (note.kind === 'cloze' && !note.cards.some((card) => card.id === cardId)) {
      throw conflict(`Review card ${cardId} does not belong to note ${noteId}`)
    }

    return this.stateStore.transaction(() => {
      const updated = this.notes.update(noteId, (current) => {
        if (current.kind === 'basic') {
          return gradeBasicNote(current, grade, dueAt, now)
        }

        return gradeClozeCard(current, cardId, grade, dueAt, now)
      })

      this.recomputeDeckStats(deck.id ?? '', deck.workspaceId, now)

      return updated
    })
  }

  private recomputeDeckStats(deckId: string, workspaceId: string, updatedAt: string) {
    const notes = this.notes.listByDeck(deckId)
    const nextStats = summarizeDeckNotes(notes, updatedAt)

    this.decks.update(deckId, (deck) => ({
      ...deck,
      ...nextStats,
      updatedAt,
    }))

    this.workspaces.touch(workspaceId, updatedAt)
  }
}
