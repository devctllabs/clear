import type {
  ClozeNoteCard,
  NoteDraft,
  NoteListItem,
  NoteStatus,
  ReviewCard,
  ReviewGrade,
} from '../../generated/clear-web-api/contract/types.gen.ts'
import type { NoteDetailRecord } from '../../generated/mock-admin/contract/index.ts'

const clozePattern = /\{\{c(\d+)::(.*?)(?:::.*?)?\}\}/gs

type CardAllocator = {
  next: (prefix: string) => string
}

const clampProgress = (progress: number) => Math.max(0, Math.min(100, progress))

const progressAfterGrade = (progress: number, grade: ReviewGrade) => {
  switch (grade) {
    case 'again':
      return clampProgress(progress - 15)
    case 'hard':
      return clampProgress(progress + 15)
    case 'good':
      return clampProgress(progress + 25)
    case 'easy':
      return clampProgress(progress + 40)
  }
}

const dueDaysAfterGrade = (grade: ReviewGrade) => {
  switch (grade) {
    case 'again':
      return 1
    case 'hard':
      return 2
    case 'good':
      return 5
    case 'easy':
      return 10
  }
}

const statusFromProgress = (progress: number): NoteStatus =>
  progress >= 100 ? 'mastered' : 'in-progress'

export const deriveClozeCards = (
  noteTitle: string,
  body: string,
  now: string,
  allocator: CardAllocator,
): ClozeNoteCard[] => {
  const matches = Array.from(body.matchAll(clozePattern))

  if (matches.length === 0) {
    return [
      {
        clozeId: 'c1',
        dueAt: now,
        id: allocator.next('card'),
        progress: 0,
        reviewedAt: now,
        status: 'in-progress',
        title: noteTitle,
      },
    ]
  }

  return matches.map((match) => ({
    clozeId: `c${match[1]}`,
    dueAt: now,
    id: allocator.next('card'),
    progress: 0,
    reviewedAt: now,
    status: 'in-progress',
    title: noteTitle,
  }))
}

const summarizeCards = (cards: ClozeNoteCard[], now: string) => {
  const totalProgress = cards.reduce((sum, card) => sum + card.progress, 0)
  const progress = cards.length === 0 ? 0 : Math.round(totalProgress / cards.length)
  const dueAt = cards.reduce<string | null>(
    (earliest, card) => (earliest === null || card.dueAt < earliest ? card.dueAt : earliest),
    null,
  ) ?? now

  return {
    dueAt,
    progress,
    reviewedAt: now,
    status: cards.every((card) => card.status === 'mastered') ? 'mastered' : 'in-progress',
  } satisfies Pick<NoteDetailRecord, 'dueAt' | 'progress' | 'reviewedAt' | 'status'>
}

export const buildNoteDetail = (
  draft: NoteDraft,
  id: string,
  now: string,
  allocator: CardAllocator,
): NoteDetailRecord => {
  if (draft.kind === 'basic') {
    return {
      deckId: draft.deckId,
      dueAt: now,
      editor: draft.editor,
      id,
      kind: 'basic',
      progress: 0,
      reviewedAt: now,
      status: 'in-progress',
      title: draft.title,
      updatedAt: now,
    }
  }

  const cards = deriveClozeCards(draft.title, draft.editor.body, now, allocator)
  const summary = summarizeCards(cards, now)

  return {
    deckId: draft.deckId,
    cards,
    dueAt: summary.dueAt,
    editor: draft.editor,
    id,
    kind: 'cloze',
    progress: summary.progress,
    reviewedAt: summary.reviewedAt,
    status: summary.status,
    title: draft.title,
    updatedAt: now,
  }
}

export const toNoteListItem = (note: NoteDetailRecord): NoteListItem => ({
  dueAt: note.dueAt,
  id: note.id ?? '',
  kind: note.kind,
  progress: note.progress,
  reviewedAt: note.reviewedAt,
  status: note.status,
  title: note.title,
  updatedAt: note.updatedAt,
})

export const toReviewCard = (note: NoteDetailRecord): ReviewCard => {
  if (note.kind === 'basic') {
    return {
      back: note.editor.back,
      front: note.editor.front,
      id: note.id ?? '',
      kind: 'basic',
      progress: note.progress,
    }
  }

  const card = note.cards[0] ?? {
    clozeId: 'c1',
    dueAt: note.dueAt,
    id: note.id ?? '',
    progress: note.progress,
    reviewedAt: note.reviewedAt,
    status: note.status,
    title: note.title,
  }

  return toReviewCardFromCloze(note, card)
}

export const toReviewCardFromCloze = (
  note: Extract<NoteDetailRecord, { kind: 'cloze' }>,
  card: ClozeNoteCard,
): ReviewCard => ({
  body: note.editor.body,
  clozeId: card.clozeId,
  id: card.id,
  kind: 'cloze',
  progress: card.progress,
})

export const buildReviewCards = (note: NoteDetailRecord): ReviewCard[] => {
  if (note.kind === 'basic') {
    return [toReviewCard(note)]
  }

  return note.cards.map((card) => toReviewCardFromCloze(note, card))
}

export const gradeBasicNote = (
  note: Extract<NoteDetailRecord, { kind: 'basic' }>,
  grade: ReviewGrade,
  dueAt: string,
  reviewedAt: string,
): Extract<NoteDetailRecord, { kind: 'basic' }> => {
  const progress = progressAfterGrade(note.progress, grade)

  return {
    ...note,
    dueAt,
    progress,
    reviewedAt,
    status: statusFromProgress(progress),
    updatedAt: reviewedAt,
  }
}

export const gradeClozeCard = (
  note: Extract<NoteDetailRecord, { kind: 'cloze' }>,
  cardId: string,
  grade: ReviewGrade,
  dueAt: string,
  reviewedAt: string,
): Extract<NoteDetailRecord, { kind: 'cloze' }> => {
  const cards = note.cards.map((card) => {
    if (card.id !== cardId) {
      return card
    }

    const progress = progressAfterGrade(card.progress, grade)

    return {
      ...card,
      dueAt,
      progress,
      reviewedAt,
      status: statusFromProgress(progress),
    }
  })

  const summary = summarizeCards(cards, reviewedAt)

  return {
    ...note,
    cards,
    dueAt: summary.dueAt,
    progress: summary.progress,
    reviewedAt: summary.reviewedAt,
    status: summary.status,
    updatedAt: reviewedAt,
  }
}

export const dueAtForGrade = (now: string, grade: ReviewGrade) => {
  const days = dueDaysAfterGrade(grade)
  return new Date(Date.parse(now) + days * 24 * 60 * 60 * 1000).toISOString()
}

export const noteCardId = (note: NoteDetailRecord) => note.id ?? ''
