import type {
  DueReviewSession,
  PracticeReviewSession,
  ReviewCard,
  ReviewGrade,
  ReviewSession,
  ReviewStartResult,
} from '../../generated/clear-web-api/contract/types.gen.ts'
import type { ReviewSessionRecord } from '../../generated/mock-admin/contract/index.ts'
import type { MockStateStore } from '../../lib/stateStore.ts'
import { conflict } from '../../generated/clear-web-api/mock-runtime.ts'
import { newIdAllocator } from '../../lib/ids.ts'
import type { DeckRepository } from '../decks/repository.ts'
import type { NotesRepository } from '../notes/repository.ts'
import { toReviewCard, toReviewCardFromCloze } from '../notes/noteDetails.ts'
import { NotesService } from '../notes/service.ts'
import { ReviewRepository } from './repository.ts'

type ReviewQueueEntry = {
  card: ReviewCard
  dueAt: string
  noteId: string
}

const elapsedSeconds = (startedAt: string, now: string) =>
  Math.max(0, Math.floor((Date.parse(now) - Date.parse(startedAt)) / 1000))

export class ReviewService {
  private readonly reviews: ReviewRepository
  private readonly notes: NotesRepository
  private readonly decks: DeckRepository
  private readonly noteService: NotesService
  private readonly stateStore: MockStateStore

  constructor(
    reviews: ReviewRepository,
    notes: NotesRepository,
    decks: DeckRepository,
    noteService: NotesService,
    stateStore: MockStateStore,
  ) {
    this.reviews = reviews
    this.notes = notes
    this.decks = decks
    this.noteService = noteService
    this.stateStore = stateStore
  }

  async startReviewSession(deckId: string): Promise<ReviewStartResult> {
    const deck = this.decks.require(deckId)
    const queue = this.buildQueue(deckId)

    if (queue.length === 0) {
      return {
        mode: 'unavailable',
        reason: 'empty-deck',
      }
    }

    return this.stateStore.transaction(async () => {
      const ids = newIdAllocator(this.stateStore.getSlice('idCounters'))
      const now = this.stateStore.now()
      const dueQueue = queue.filter((entry) => entry.dueAt <= now)

      if (dueQueue.length > 0) {
        const session: DueReviewSession = {
          currentCard: dueQueue[0].card,
          deckId: deck.id ?? '',
          durationSeconds: 0,
          id: ids.next('review'),
          mode: 'due',
          plannedCount: dueQueue.length,
          reviewedCount: 0,
          startedAt: now,
          status: 'active',
        }

        await this.reviews.create(session as unknown as ReviewSessionRecord)

        return session
      }

      const session: PracticeReviewSession = {
        currentCard: queue[0].card,
        deckId: deck.id ?? '',
        durationSeconds: 0,
        id: ids.next('review'),
        mode: 'practice',
        reviewedCount: 0,
        startedAt: now,
      }

      await this.reviews.create(session as unknown as ReviewSessionRecord)

      return session
    })
  }

  getReviewSession(reviewId: string) {
    return this.reviews.require(reviewId)
  }

  async gradeReviewSessionCard(reviewId: string, cardId: string, grade: ReviewGrade): Promise<ReviewSession> {
    const session = this.reviews.require(reviewId)
    const queue = this.buildQueue(session.deckId)
    const currentIndex = queue.findIndex((entry) => entry.card.id === cardId)

    if (!session.currentCard || session.currentCard.id !== cardId || currentIndex < 0) {
      throw conflict(`Review card ${cardId} is not the current card for session ${reviewId}`)
    }

    return this.stateStore.transaction(async () => {
      const now = this.stateStore.now()
      await this.noteService.gradeNoteCard(queue[currentIndex].noteId, cardId, grade)
      const nextQueue = this.buildQueue(session.deckId)
      const durationSeconds = elapsedSeconds(session.startedAt, now)

      if (session.mode === 'due') {
        const remainingDue = nextQueue.filter((entry) => entry.dueAt <= now)
        const completed = session.reviewedCount + 1 >= session.plannedCount || remainingDue.length === 0
        const nextCard = remainingDue.find((entry) =>
          nextQueue.findIndex((candidate) => candidate.card.id === entry.card.id) > currentIndex,
        ) ?? remainingDue[0]

        const updated = await this.reviews.update(reviewId, (current) => ({
          ...(current as DueReviewSession),
          completedAt: completed ? now : (current as DueReviewSession).completedAt,
          currentCard: completed ? null : nextCard?.card ?? null,
          durationSeconds,
          reviewedCount: (current as DueReviewSession).reviewedCount + 1,
          status: completed ? 'completed' : (current as DueReviewSession).status,
        }) as DueReviewSession)

        return updated
      }

      const nextCard = nextQueue[(currentIndex + 1) % nextQueue.length]?.card ?? queue[0].card

      return this.reviews.update(reviewId, (current) => ({
        ...(current as PracticeReviewSession),
        currentCard: nextCard,
        durationSeconds,
        reviewedCount: (current as PracticeReviewSession).reviewedCount + 1,
      }) as PracticeReviewSession)
    })
  }

  private buildQueue(deckId: string): ReviewQueueEntry[] {
    return this.notes.listByDeck(deckId).flatMap((note) => {
      if (note.kind === 'basic') {
        return [
          {
            card: toReviewCard(note),
            dueAt: note.dueAt,
            noteId: note.id ?? '',
          },
        ]
      }

      return note.cards.map((card) => ({
        card: toReviewCardFromCloze(note, card),
        dueAt: card.dueAt,
        noteId: note.id ?? '',
      }))
    })
  }
}
