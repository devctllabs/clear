export type ReviewGrade = 'again' | 'easy' | 'good' | 'hard'

export type BasicReviewCard = {
  back: string
  front: string
  id: string
  kind: 'basic'
  progress: number
}

export type ClozeReviewCard = {
  body: string
  clozeId: string
  id: string
  kind: 'cloze'
  progress: number
}

export type ReviewCard = BasicReviewCard | ClozeReviewCard

export type DueReviewSession = {
  completedAt?: string
  currentCard?: ReviewCard
  deckId: string
  durationSeconds: number
  id: string
  mode: 'due'
  plannedCount: number
  reviewedCount: number
  startedAt: string
  status: 'active' | 'completed'
}

export type PracticeReviewSession = {
  currentCard: ReviewCard
  deckId: string
  durationSeconds: number
  id: string
  mode: 'practice'
  reviewedCount: number
  startedAt: string
}

export type ReviewSession = DueReviewSession | PracticeReviewSession

export type ReviewStartResult =
  | ReviewSession
  | {
      mode: 'unavailable'
      reason: 'empty-deck'
    }
