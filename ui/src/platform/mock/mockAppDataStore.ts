import type {
  DeckSearchResult,
  FolderSearchResult,
  NoteSearchResult,
  SearchResult,
  SearchResultGroup,
  SearchScope,
} from '@features/content-search'
import type { Deck, DeckDetail, DeckDraft } from '@features/decks'
import type { Folder, FolderDraft } from '@features/folders'
import type {
  ClozeNoteCard,
  NoteDetail,
  NoteDraft,
  NoteListItem,
  NoteRef,
} from '@features/notes'
import type {
  DueReviewSession,
  PracticeReviewSession,
  ReviewCard,
  ReviewGrade,
  ReviewSession,
  ReviewStartResult,
} from '@features/review'
import type { TrashItem, TrashState } from '@features/trash'
import type { Settings } from '@features/settings'
import type { Workspace, WorkspaceDraft } from '@features/workspaces'
import { writeJson } from '@shared/services/storage/jsonStorage'
import type { SortPreference } from '@shared/types/sort.types'

type MockState = {
  activeWorkspaceId: string
  deckDetails: Record<string, Pick<DeckDetail, 'dueToday' | 'progress' | 'totalNotes'>>
  decks: DeckRecord[]
  folders: FolderRecord[]
  idCounters: Record<string, number>
  notes: NoteRecord[]
  reviews: ReviewSessionRecord[]
  settings: Settings
  trash: TrashState
  workspaces: WorkspaceRecord[]
}

type ReviewGradeRecord = {
  cardId: string
  grade: ReviewGrade
  noteId: string
  reviewedAt: string
}
type DueReviewSessionRecord = {
  cardIds: string[]
  completedAt?: string
  deckId: string
  id: string
  mode: 'due'
  reviewedCards: ReviewGradeRecord[]
  startedAt: string
  status: DueReviewSession['status']
}
type PracticeReviewSessionRecord = {
  currentCardId: string
  deckId: string
  id: string
  mode: 'practice'
  reviewedCards: ReviewGradeRecord[]
  startedAt: string
}
type ReviewSessionRecord = DueReviewSessionRecord | PracticeReviewSessionRecord

type DeletedRecord = {
  deletedAt?: string
}
type DeckRecord = Deck & DeletedRecord
type FolderRecord = Folder & DeletedRecord
type WorkspaceRecord = Workspace & DeletedRecord
type BasicNoteRecord = Extract<NoteDetail, { kind: 'basic' }> & DeletedRecord
type ClozeNoteRecord = Extract<NoteDetail, { kind: 'cloze' }> & DeletedRecord
type NoteRecord = BasicNoteRecord | ClozeNoteRecord
type ReviewSchedulerFields = {
  deckId: string
  dueAt: string
  noteId: string
  reviewedAt: string
  status: NoteDetail['status']
  title: string
  workspaceId: string
}
type BasicReviewSchedulerCard = Extract<ReviewCard, { kind: 'basic' }> &
  ReviewSchedulerFields
type ClozeReviewSchedulerCard = Extract<ReviewCard, { kind: 'cloze' }> &
  ReviewSchedulerFields
type ReviewSchedulerCard = BasicReviewSchedulerCard | ClozeReviewSchedulerCard

type SeedNote = {
  note: NoteRecord
}

const storageKey = 'clear-ui:mock-state:v15'
const dayMs = 24 * 60 * 60 * 1000
const hourMs = 60 * 60 * 1000
const minuteMs = 60 * 1000
const seedNow = Date.now()

const isoNow = () => new Date(seedNow).toISOString()
const daysAgo = (days: number) => new Date(seedNow - days * dayMs).toISOString()
const daysFromNow = (days: number) => new Date(seedNow + days * dayMs).toISOString()
const hoursAgo = (hours: number) => new Date(seedNow - hours * hourMs).toISOString()
const minutesAgo = (minutes: number) => new Date(seedNow - minutes * minuteMs).toISOString()

const createIdAllocator = (counters: Record<string, number>) => ({
  next(prefix: string) {
    const value = counters[prefix] ?? 1
    counters[prefix] = value + 1

    return `${prefix}-${value}`
  },
})

const defaultSettings = (): Settings => ({
  dailyNewLimit: 20,
  dailyReviewLimit: 100,
  fsrsParams: [
    0.212, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194, 0.001, 1.8722,
    0.1666, 0.796, 1.4835, 0.0614, 0.2629, 1.6483, 0.6014, 1.8729,
    0.5425, 0.0912, 0.0658, 0.1542,
  ],
  fsrsRetention: 90,
  language: 'en-US',
  masteryHorizonDays: 30,
  newCardsOrder: 'before_review',
  timezone: 'auto',
})

const basicCardId = (noteId: string) => `${noteId}:basic`

const clozeCardId = (noteId: string, clozeId: string) => `${noteId}:${clozeId}`

const aggregateClozeCards = (
  cards: ClozeNoteCard[],
  fallback: Pick<NoteDetail, 'dueAt' | 'progress' | 'reviewedAt' | 'status'>,
) => {
  if (cards.length === 0) {
    return fallback
  }

  return {
    dueAt: cards.reduce((earliest, card) => (card.dueAt < earliest ? card.dueAt : earliest), cards[0].dueAt),
    progress: cards.reduce((total, card) => total + card.progress, 0) / cards.length,
    reviewedAt: cards.reduce(
      (latest, card) => (card.reviewedAt > latest ? card.reviewedAt : latest),
      cards[0].reviewedAt,
    ),
    status: cards.every((card) => card.status === 'mastered') ? 'mastered' : 'in-progress',
  } satisfies Pick<NoteDetail, 'dueAt' | 'progress' | 'reviewedAt' | 'status'>
}

const basicNote = ({
  back,
  deckId,
  dueAt,
  front,
  id,
  progress,
  reviewedAt,
  status,
  title,
  updatedAt,
}: {
  back: string
  deckId: string
  dueAt: string
  front: string
  id: string
  progress: number
  reviewedAt: string
  status: NoteDetail['status']
  title: string
  updatedAt: string
}): SeedNote => ({
  note: {
    deckId,
    dueAt,
    editor: { back, front },
    id,
    kind: 'basic',
    progress,
    reviewedAt,
    status,
    title,
    updatedAt,
  },
})

const clozeNote = ({
  body,
  cards,
  deckId,
  id,
  progress,
  reviewedAt,
  status,
  title,
  updatedAt,
}: {
  body: string
  cards: Array<{
    clozeId?: string
    dueAt: string
    id: string
    progress: number
    reviewedAt: string
    status?: NoteDetail['status']
    title: string
  }>
  deckId: string
  id: string
  progress: number
  reviewedAt: string
  status: NoteDetail['status']
  title: string
  updatedAt: string
}): SeedNote => {
  const noteCards = cards.map((card) => {
    const clozeId = card.clozeId ?? card.id

    return {
      clozeId,
      dueAt: card.dueAt,
      id: clozeCardId(id, clozeId),
      progress: card.progress,
      reviewedAt: card.reviewedAt,
      status: card.status ?? status,
      title: card.title,
    }
  })
  const aggregate = aggregateClozeCards(noteCards, {
    dueAt: noteCards[0]?.dueAt ?? daysFromNow(1),
    progress,
    reviewedAt,
    status,
  })

  return {
    note: {
      cards: noteCards,
      deckId,
      dueAt: aggregate.dueAt,
      editor: { body },
      id,
      kind: 'cloze',
      progress: aggregate.progress,
      reviewedAt: aggregate.reviewedAt,
      status: aggregate.status,
      title,
      updatedAt,
    },
  }
}

const seedNoteRecords = (): SeedNote[] => [
  basicNote({
    back: 'Mechanization, capital investment, and urban labor markets accelerated industrialization.',
    deckId: 'world-history',
    dueAt: daysFromNow(1),
    front: 'Industrial Revolution',
    id: 'industrial-revolution-causes',
    progress: 74,
    reviewedAt: daysAgo(3),
    status: 'mastered',
    title: 'Industrial Revolution Causes',
    updatedAt: daysAgo(3),
  }),
  clozeNote({
    body:
      'Collective memory shapes how communities interpret {{c1::historical evidence}} and preserve {{c2::public narratives}} across generations.',
    deckId: 'world-history',
    cards: [
      {
        dueAt: daysFromNow(1),
        id: 'c1',
        progress: 74,
        reviewedAt: daysAgo(3),
        title: 'Historical Evidence',
      },
      {
        dueAt: daysFromNow(4),
        id: 'c2',
        progress: 42,
        reviewedAt: daysAgo(1),
        title: 'Public Narratives',
      },
    ],
    id: 'collective-memory',
    progress: 42,
    reviewedAt: daysAgo(1),
    status: 'in-progress',
    title: 'Collective Memory',
    updatedAt: daysAgo(1),
  }),
  basicNote({
    back: 'A constitutional crisis emerges when institutions dispute authority or legitimacy.',
    deckId: 'world-history',
    dueAt: daysFromNow(1),
    front: 'Separation of Powers',
    id: 'constitutional-crisis',
    progress: 52,
    reviewedAt: isoNow(),
    status: 'in-progress',
    title: 'Constitutional Crisis',
    updatedAt: isoNow(),
  }),
  basicNote({
    back: 'Diaries, letters, newspapers, and official records anchor historical interpretation.',
    deckId: 'world-history',
    dueAt: daysFromNow(1),
    front: 'Primary Sources',
    id: 'primary-source-notes',
    progress: 61,
    reviewedAt: isoNow(),
    status: 'in-progress',
    title: 'Primary Source Notes',
    updatedAt: isoNow(),
  }),
  basicNote({
    back: 'Atlantic revolutions linked republican ideas, rights claims, and popular sovereignty.',
    deckId: 'world-history',
    dueAt: daysFromNow(2),
    front: 'Atlantic Revolutions',
    id: 'atlantic-revolutions-outline',
    progress: 88,
    reviewedAt: isoNow(),
    status: 'mastered',
    title: 'Atlantic Revolutions Outline',
    updatedAt: isoNow(),
  }),
  basicNote({
    back: 'Detente used diplomacy and arms control to reduce Cold War escalation risk.',
    deckId: 'world-history',
    dueAt: daysFromNow(1),
    front: 'Cold War Detente',
    id: 'cold-war-detente-recap',
    progress: 47,
    reviewedAt: isoNow(),
    status: 'in-progress',
    title: 'Cold War Detente Recap',
    updatedAt: isoNow(),
  }),
  basicNote({
    back: 'Civil rights campaigns combined mass mobilization, legal strategy, and federal pressure.',
    deckId: 'world-history',
    dueAt: daysFromNow(3),
    front: 'Civil Rights Movement',
    id: 'civil-rights-movement-cards',
    progress: 84,
    reviewedAt: isoNow(),
    status: 'mastered',
    title: 'Civil Rights Movement Cards',
    updatedAt: isoNow(),
  }),
  basicNote({
    back: 'Working memory keeps a small amount of information active for immediate reasoning.',
    deckId: 'attention-and-memory',
    dueAt: daysFromNow(1),
    front: 'Working Memory',
    id: 'working-memory-limits',
    progress: 68,
    reviewedAt: daysAgo(2),
    status: 'mastered',
    title: 'Working Memory Limits',
    updatedAt: daysAgo(2),
  }),
  clozeNote({
    body:
      'Cognitive biases shift how {{c1::evidence}} is weighted when {{c2::context}} changes.',
    deckId: 'attention-and-memory',
    cards: [
      {
        dueAt: daysFromNow(3),
        id: 'c1',
        progress: 57,
        reviewedAt: daysAgo(1),
        title: 'Evidence',
      },
      {
        dueAt: daysFromNow(5),
        id: 'c2',
        progress: 35,
        reviewedAt: isoNow(),
        title: 'Context',
      },
    ],
    id: 'cognitive-bias-review',
    progress: 57,
    reviewedAt: daysAgo(1),
    status: 'in-progress',
    title: 'Cognitive Bias Review',
    updatedAt: daysAgo(1),
  }),
  basicNote({
    back: 'Schemas organize prior knowledge so new information can be interpreted quickly.',
    deckId: 'attention-and-memory',
    dueAt: daysFromNow(1),
    front: 'Schema Formation',
    id: 'schema-formation',
    progress: 49,
    reviewedAt: isoNow(),
    status: 'in-progress',
    title: 'Schema Formation',
    updatedAt: daysAgo(2),
  }),
  basicNote({
    back: 'Checks and balances distribute authority so institutions can constrain each other.',
    deckId: 'political-thought',
    dueAt: daysFromNow(1),
    front: 'Checks and Balances',
    id: 'checks-and-balances',
    progress: 71,
    reviewedAt: daysAgo(4),
    status: 'mastered',
    title: 'Checks and Balances',
    updatedAt: daysAgo(4),
  }),
  clozeNote({
    body:
      'A coalition becomes durable when the {{c1::policy bargain}} is credible and {{c2::incentives}} are transparent.',
    deckId: 'political-thought',
    cards: [
      {
        dueAt: daysFromNow(1),
        id: 'c1',
        progress: 43,
        reviewedAt: daysAgo(2),
        title: 'Policy Bargain',
      },
      {
        dueAt: daysFromNow(4),
        id: 'c2',
        progress: 24,
        reviewedAt: daysAgo(1),
        title: 'Incentives',
      },
    ],
    id: 'coalition-building',
    progress: 43,
    reviewedAt: daysAgo(2),
    status: 'in-progress',
    title: 'Coalition Building',
    updatedAt: daysAgo(2),
  }),
  basicNote({
    back: 'Institutional design defines the rules, offices, and procedures that govern authority.',
    deckId: 'political-thought',
    dueAt: daysFromNow(2),
    front: 'Institutional Design',
    id: 'institutional-design',
    progress: 39,
    reviewedAt: isoNow(),
    status: 'in-progress',
    title: 'Institutional Design',
    updatedAt: isoNow(),
  }),
  basicNote({
    back: 'Anchoring pulls judgment toward the first number or frame that enters a decision.',
    deckId: 'cognitive-biases',
    dueAt: daysFromNow(1),
    front: 'Anchoring',
    id: 'anchoring',
    progress: 64,
    reviewedAt: hoursAgo(6),
    status: 'in-progress',
    title: 'Anchoring',
    updatedAt: hoursAgo(6),
  }),
  clozeNote({
    body:
      'Availability bias makes {{c1::vivid examples}} feel more common than they really are.',
    deckId: 'cognitive-biases',
    cards: [
      {
        dueAt: daysFromNow(2),
        id: 'c1',
        progress: 53,
        reviewedAt: hoursAgo(3),
        title: 'Vivid Examples',
      },
    ],
    id: 'availability-heuristic',
    progress: 53,
    reviewedAt: hoursAgo(3),
    status: 'in-progress',
    title: 'Availability Heuristic',
    updatedAt: hoursAgo(3),
  }),
  basicNote({
    back: 'People usually feel losses more strongly than equivalent gains.',
    deckId: 'cognitive-biases',
    dueAt: daysFromNow(2),
    front: 'Loss Aversion',
    id: 'loss-aversion',
    progress: 69,
    reviewedAt: isoNow(),
    status: 'mastered',
    title: 'Loss Aversion',
    updatedAt: isoNow(),
  }),
  basicNote({
    back: 'Separated powers distribute authority so each branch can restrain the others.',
    deckId: 'political-thought',
    dueAt: daysFromNow(2),
    front: 'Separation of Powers',
    id: 'separation-of-powers',
    progress: 58,
    reviewedAt: hoursAgo(9),
    status: 'in-progress',
    title: 'Separation of Powers',
    updatedAt: hoursAgo(9),
  }),
  basicNote({
    back: 'Federalism divides governing authority across national and regional institutions.',
    deckId: 'political-thought',
    dueAt: daysFromNow(2),
    front: 'Federalism',
    id: 'federalism',
    progress: 47,
    reviewedAt: daysAgo(1),
    status: 'in-progress',
    title: 'Federalism',
    updatedAt: daysAgo(1),
  }),
  basicNote({
    back: 'Rule of law means public power operates through known rules rather than personal discretion.',
    deckId: 'political-thought',
    dueAt: daysFromNow(3),
    front: 'Rule of Law',
    id: 'rule-of-law',
    progress: 57,
    reviewedAt: daysAgo(2),
    status: 'mastered',
    title: 'Rule of Law',
    updatedAt: daysAgo(2),
  }),
  basicNote({
    back: 'A base rate is the background frequency you should account for before focusing on a vivid case.',
    deckId: 'statistics-basics',
    dueAt: daysFromNow(3),
    front: 'Base Rates',
    id: 'base-rates',
    progress: 48,
    reviewedAt: daysAgo(1),
    status: 'in-progress',
    title: 'Base Rates',
    updatedAt: daysAgo(1),
  }),
  basicNote({
    back: 'A representation uses only a few active units.',
    deckId: 'neural-models',
    dueAt: daysFromNow(2),
    front: 'Sparse Coding',
    id: 'sparse-coding',
    progress: 31,
    reviewedAt: hoursAgo(5),
    status: 'in-progress',
    title: 'Sparse Coding',
    updatedAt: hoursAgo(5),
  }),
  clozeNote({
    body: 'The {{c1::prediction}} error drives model refinement.',
    deckId: 'neural-models',
    cards: [
      {
        dueAt: daysFromNow(3),
        id: 'c1',
        progress: 61,
        reviewedAt: daysAgo(1),
        title: 'Prediction',
      },
      {
        dueAt: daysFromNow(6),
        id: 'c2',
        progress: 28,
        reviewedAt: isoNow(),
        title: 'Refinement',
      },
    ],
    id: 'predictive-coding',
    progress: 61,
    reviewedAt: daysAgo(1),
    status: 'mastered',
    title: 'Predictive Coding',
    updatedAt: daysAgo(1),
  }),
  basicNote({
    back: 'Social structures connect norms, institutions, and networks into stable patterns.',
    deckId: 'social-theory',
    dueAt: daysFromNow(1),
    front: 'Social Structure',
    id: 'social-structure-basics',
    progress: 70,
    reviewedAt: isoNow(),
    status: 'mastered',
    title: 'Social Structure Basics',
    updatedAt: isoNow(),
  }),
  clozeNote({
    body:
      'The {{c1::method}} archive preserves experimental structure, procedure, and analysis notes for future review.',
    deckId: 'method-archives',
    cards: [
      {
        dueAt: daysFromNow(3),
        id: 'c1',
        progress: 52,
        reviewedAt: isoNow(),
        title: 'Method',
      },
    ],
    id: 'method-archive-overview',
    progress: 52,
    reviewedAt: isoNow(),
    status: 'in-progress',
    title: 'Method Archive Overview',
    updatedAt: isoNow(),
  }),
  basicNote({
    back: 'Procedure, evaluation, refinement',
    deckId: 'applied-analysis',
    dueAt: daysFromNow(2),
    front: 'Analysis',
    id: 'applied-analysis-note',
    progress: 56,
    reviewedAt: isoNow(),
    status: 'in-progress',
    title: 'Applied Analysis Note',
    updatedAt: isoNow(),
  }),
  clozeNote({
    body: 'The {{c1::archive}} keeps analysis together for later study.',
    deckId: 'archive-studies',
    cards: [
      {
        dueAt: daysFromNow(4),
        id: 'c1',
        progress: 47,
        reviewedAt: isoNow(),
        title: 'Archive',
      },
    ],
    id: 'archive-studies-note',
    progress: 47,
    reviewedAt: isoNow(),
    status: 'mastered',
    title: 'Archive Studies Note',
    updatedAt: isoNow(),
  }),
]

const seedNotes = (): NoteRecord[] => seedNoteRecords().map(({ note }) => note)

const seedState = (): MockState => ({
  activeWorkspaceId: 'independent-study',
  deckDetails: {
    'world-history': { dueToday: 9, progress: 71, totalNotes: 7 },
    'attention-and-memory': { dueToday: 64, progress: 58, totalNotes: 3 },
    'political-thought': { dueToday: 2, progress: 54, totalNotes: 3 },
    'cognitive-biases': { dueToday: 6, progress: 62, totalNotes: 3 },
    'reading-review-queue': { dueToday: 2, progress: 51, totalNotes: 1 },
    'statistics-basics': { dueToday: 3, progress: 48, totalNotes: 1 },
    'neural-models': { dueToday: 26, progress: 44, totalNotes: 2 },
    'social-theory': { dueToday: 18, progress: 55, totalNotes: 1 },
    'method-archives': { dueToday: 15, progress: 52, totalNotes: 1 },
    'applied-analysis': { dueToday: 11, progress: 51, totalNotes: 1 },
    'archive-studies': { dueToday: 8, progress: 47, totalNotes: 1 },
  },
  workspaces: [
    {
      description: 'Reading notes, review decks, and reference material for ongoing study.',
      icon: 'layers-3',
      id: 'independent-study',
      title: 'Independent Study',
      updatedAt: minutesAgo(2),
    },
    {
      description: 'Completed decks, older notes, and material worth keeping.',
      icon: 'archive',
      id: 'reading-archive',
      title: 'Reading Archive',
      updatedAt: hoursAgo(4),
    },
  ],
  folders: [
    {
      description: 'Topic notes, excerpts, and outlines for active study.',
      id: 'reading-notes',
      name: 'Reading Notes',
      parentId: 'independent-study',
      updatedAt: isoNow(),
      workspaceId: 'independent-study',
    },
    {
      description: 'Timelines, turning points, and historical reading notes.',
      id: 'history',
      name: 'History',
      parentId: 'reading-notes',
      updatedAt: daysAgo(1),
      workspaceId: 'independent-study',
    },
    {
      description: 'Attention, memory, and judgment topics for spaced review.',
      id: 'psychology',
      name: 'Psychology',
      parentId: 'reading-notes',
      updatedAt: daysAgo(2),
      workspaceId: 'independent-study',
    },
    {
      description: 'Long-form ideas and theory notes kept for later review.',
      id: 'philosophy',
      name: 'Philosophy',
      parentId: 'reading-notes',
      updatedAt: daysAgo(3),
      workspaceId: 'independent-study',
    },
    {
      description: 'Frameworks, summaries, and reusable study scaffolds.',
      id: 'reference',
      name: 'Reference',
      parentId: 'independent-study',
      updatedAt: isoNow(),
      workspaceId: 'independent-study',
    },
    {
      description: 'Argument structure, drafting patterns, and revision aids.',
      id: 'writing',
      name: 'Writing',
      parentId: 'reference',
      updatedAt: daysAgo(4),
      workspaceId: 'independent-study',
    },
    {
      description: 'Statistics, measurement, and repeatable study workflows.',
      id: 'methods',
      name: 'Methods',
      parentId: 'reference',
      updatedAt: daysAgo(5),
      workspaceId: 'independent-study',
    },
  ],
  decks: [
    {
      description: 'Judgment traps worth reviewing until they become visible in the moment.',
      dueToday: 6,
      parentId: 'independent-study',
      icon: 'brain',
      id: 'cognitive-biases',
      progress: 62,
      title: 'Cognitive Biases',
      totalNotes: 3,
      updatedAt: hoursAgo(5),
      workspaceId: 'independent-study',
    },
    {
      description: 'Core institutions, ideas, and recurring arguments in political theory.',
      dueToday: 2,
      parentId: 'reading-notes',
      icon: 'archive',
      id: 'reading-review-queue',
      progress: 51,
      title: 'Reading Review Queue',
      totalNotes: 1,
      updatedAt: hoursAgo(9),
      workspaceId: 'independent-study',
    },
    {
      description: 'Base-rate reasoning and small quantitative concepts for everyday study decisions.',
      dueToday: 3,
      parentId: 'reference',
      icon: 'graduation-cap',
      id: 'statistics-basics',
      progress: 48,
      title: 'Statistics Basics',
      totalNotes: 1,
      updatedAt: daysAgo(1),
      workspaceId: 'independent-study',
    },
    {
      description: 'Turning points, institutions, and broad patterns that repay repeated review.',
      dueToday: 9,
      parentId: 'independent-study',
      icon: 'book-open',
      id: 'world-history',
      progress: 71,
      title: 'World History',
      totalNotes: 7,
      updatedAt: hoursAgo(9),
      workspaceId: 'independent-study',
    },
    {
      description: 'Attention, working memory, and schema formation in one compact deck.',
      dueToday: 5,
      parentId: 'psychology',
      icon: 'brain',
      id: 'attention-and-memory',
      progress: 58,
      title: 'Attention and Memory',
      totalNotes: 3,
      updatedAt: daysAgo(1),
      workspaceId: 'independent-study',
    },
    {
      description: 'Institutions, sovereignty, and the structure of political order.',
      dueToday: 2,
      parentId: 'independent-study',
      icon: 'landmark',
      id: 'political-thought',
      progress: 54,
      title: 'Political Thought',
      totalNotes: 3,
      updatedAt: daysAgo(1),
      workspaceId: 'independent-study',
    },
    {
      description: '',
      dueToday: 18,
      parentId: 'psychology',
      icon: 'brain',
      id: 'neural-models',
      progress: 31,
      title: 'Neural Models',
      totalNotes: 2,
      updatedAt: hoursAgo(5),
      workspaceId: 'independent-study',
    },
    {
      description: '',
      dueToday: 12,
      parentId: 'philosophy',
      icon: 'network',
      id: 'social-theory',
      progress: 63,
      title: 'Social Theory',
      totalNotes: 1,
      updatedAt: isoNow(),
      workspaceId: 'independent-study',
    },
    {
      description: '',
      dueToday: 9,
      parentId: 'writing',
      icon: 'shapes',
      id: 'method-archives',
      progress: 49,
      title: 'Method Archives',
      totalNotes: 1,
      updatedAt: isoNow(),
      workspaceId: 'independent-study',
    },
    {
      description: '',
      dueToday: 6,
      parentId: 'methods',
      icon: 'shapes',
      id: 'applied-analysis',
      progress: 40,
      title: 'Applied Analysis',
      totalNotes: 1,
      updatedAt: isoNow(),
      workspaceId: 'independent-study',
    },
    {
      description: '',
      dueToday: 4,
      parentId: 'writing',
      icon: 'languages',
      id: 'archive-studies',
      progress: 36,
      title: 'Archive Studies',
      totalNotes: 1,
      updatedAt: isoNow(),
      workspaceId: 'independent-study',
    },
  ],
  idCounters: {
    workspace: 1,
    folder: 1,
    deck: 1,
    note: 1,
    review: 1,
    card: 1,
  },
  notes: seedNotes(),
  reviews: [],
  settings: defaultSettings(),
  trash: {
    items: [
      {
        deletedAt: daysAgo(5),
        id: 'drafting-patterns',
        kind: 'deck',
        locationPath: ['Independent Study', 'Reference', 'Writing'],
        title: 'Drafting Patterns',
      },
      {
        deletedAt: daysAgo(2),
        id: 'sampling-error-notes',
        kind: 'note',
        locationPath: ['Independent Study', 'Reference', 'Statistics Basics'],
        title: 'Sampling Error Notes',
      },
      {
        deletedAt: daysAgo(7),
        id: 'drafts',
        kind: 'folder',
        locationPath: ['Independent Study'],
        title: 'Drafts',
      },
      {
        deletedAt: daysAgo(8),
        id: 'completed-reading-log',
        kind: 'note',
        locationPath: ['Reading Archive', 'Archive'],
        title: 'Completed Reading Log',
      },
      {
        deletedAt: daysAgo(9),
        id: 'linguistic-atlas',
        kind: 'workspace',
        locationPath: ['Workspaces'],
        title: 'Linguistic Atlas',
      },
    ],
    lastEmptiedAt: daysAgo(2),
  },
})

const loadInitialState = (): MockState => {
  const fallback = seedState()

  if (typeof window === 'undefined') {
    return fallback
  }

  const raw = window.localStorage.getItem(storageKey)

  if (!raw) {
    writeJson(storageKey, fallback)
    return fallback
  }

  try {
    return JSON.parse(raw) as MockState
  } catch {
    writeJson(storageKey, fallback)
    return fallback
  }
}

const state = loadInitialState()

const persist = () => writeJson(storageKey, state)

const touchWorkspace = (workspaceId: string) => {
  state.workspaces = state.workspaces.map((workspace) =>
    workspace.id === workspaceId ? { ...workspace, updatedAt: isoNow() } : workspace,
  )
}

const workspaceIdForParentFolder = (parentId: string) =>
  visible(state.workspaces).some((workspace) => workspace.id === parentId)
    ? parentId
    : visible(state.folders).find((folder) => folder.id === parentId)?.workspaceId ??
      parentId

const workspaceIdForParent = (parentId: string) =>
  visible(state.workspaces).some((workspace) => workspace.id === parentId)
    ? parentId
    : visible(state.folders).find((folder) => folder.id === parentId)?.workspaceId ?? parentId

const workspaceIdForDeck = (deckId: string) =>
  visible(state.decks).find((deck) => deck.id === deckId)?.workspaceId ?? activeWorkspace().id

const addTrashItem = (item: TrashItem) => {
  state.trash = {
    ...state.trash,
    items: [item, ...state.trash.items.filter((candidate) => candidate.id !== item.id)],
  }
}

const visible = <T extends { deletedAt?: string }>(items: readonly T[]) =>
  items.filter((item) => !item.deletedAt)

const publicWorkspace = (record: WorkspaceRecord): Workspace => {
  const workspace = { ...record }
  delete workspace.deletedAt

  return workspace
}

const publicFolder = (record: FolderRecord): Folder => {
  const folder = { ...record }
  delete folder.deletedAt

  return folder
}

const publicDeck = (record: DeckRecord): Deck => {
  const deck = { ...record }
  delete deck.deletedAt

  return deck
}

const publicNote = (note: NoteRecord): NoteDetail => {
  const publicFields = { ...note }
  delete publicFields.deletedAt

  return publicFields as NoteDetail
}

const publicReviewCard = (card: ReviewSchedulerCard): ReviewCard => {
  if (card.kind === 'basic') {
    return {
      back: card.back,
      front: card.front,
      id: card.id,
      kind: 'basic',
      progress: card.progress,
    }
  }

  return {
    body: card.body,
    clozeId: card.clozeId,
    id: card.id,
    kind: 'cloze',
    progress: card.progress,
  }
}

const noteCountsByDeck = () => {
  const counts = new Map<string, number>()

  for (const note of visible(state.notes)) {
    counts.set(note.deckId, (counts.get(note.deckId) ?? 0) + 1)
  }

  return counts
}

const normalizeDeckTotalNotes = () => {
  const counts = noteCountsByDeck()

  state.decks = state.decks.map((deck) => {
    const legacy = deck as Deck & { totalCards?: number }
    const next = { ...legacy }
    delete next.totalCards

    return {
      ...next,
      totalNotes: counts.get(deck.id) ?? legacy.totalNotes ?? legacy.totalCards ?? 0,
    }
  })
  state.deckDetails = Object.fromEntries(
    Object.entries(state.deckDetails).map(([deckId, detail]) => {
      const legacy = detail as typeof detail & { totalCards?: number }
      const next = { ...legacy }
      delete next.totalCards

      return [
        deckId,
        {
          ...next,
          totalNotes: counts.get(deckId) ?? legacy.totalNotes ?? legacy.totalCards ?? 0,
        },
      ]
    }),
  )
}

const normalizeNotes = () => {
  state.notes = state.notes.map((note) => {
    const legacy = note as NoteDetail & { workspaceId?: string }
    const next = { ...legacy }
    delete next.workspaceId

    return next
  })
}

const bumpDeckTotalNotes = (deckId: string, amount: number) => {
  state.decks = state.decks.map((deck) =>
    deck.id === deckId
      ? {
          ...deck,
          totalNotes: Math.max(0, deck.totalNotes + amount),
          updatedAt: isoNow(),
        }
      : deck,
  )
  const detail = state.deckDetails[deckId]

  if (detail) {
    state.deckDetails = {
      ...state.deckDetails,
      [deckId]: {
        ...detail,
        totalNotes: Math.max(0, detail.totalNotes + amount),
      },
    }
  }
}

normalizeNotes()
normalizeDeckTotalNotes()

const sortByPreference = <
  T extends { dueToday?: number; name?: string; title?: string; updatedAt: string },
>(
  items: readonly T[],
  sort: SortPreference = { direction: 'asc', field: 'title' },
) =>
  [...items].sort((left, right) => {
    const direction = sort.direction === 'asc' ? 1 : -1
    let value: number

    if (sort.field === 'updated') {
      value = new Date(left.updatedAt).getTime() - new Date(right.updatedAt).getTime()
    } else if (sort.field === 'dueToday') {
      value = (left.dueToday ?? 0) - (right.dueToday ?? 0)
    } else {
      value = (left.title ?? left.name ?? '').localeCompare(right.title ?? right.name ?? '')
    }

    return value * direction
  })

const clozeMarkersFromBody = (body: string) => {
  const markers: Array<{ clozeId: string; text: string }> = []
  const pattern = /\{\{(c\d+)::(.*?)\}\}/g
  const seen = new Set<string>()
  let match: RegExpExecArray | null

  while ((match = pattern.exec(body)) !== null) {
    if (seen.has(match[1])) {
      continue
    }

    seen.add(match[1])
    markers.push({
      clozeId: match[1],
      text: match[2],
    })
  }

  return markers
}

const noteSearchText = (note: NoteRecord) =>
  [
    note.title,
    note.kind === 'basic' ? note.editor.front : note.editor.body,
    note.kind === 'basic' ? note.editor.back : '',
  ]
    .join(' ')
    .toLowerCase()

const folderPathSegments = (folderId: string): string[] => {
  const folder = state.folders.find((candidate) => candidate.id === folderId)

  if (!folder) {
    return []
  }

  if (folder.parentId === folder.workspaceId) {
    return [folder.name]
  }

  return [...folderPathSegments(folder.parentId), folder.name]
}

const workspaceTitle = (workspaceId: string) =>
  state.workspaces.find((workspace) => workspace.id === workspaceId)?.title ?? 'Workspace'

const deckLocationPath = (deck: DeckRecord) => [
  workspaceTitle(deck.workspaceId),
  ...(deck.parentId === deck.workspaceId ? [] : folderPathSegments(deck.parentId)),
]

const folderContainerLocationPath = (folder: FolderRecord) => [
  workspaceTitle(folder.workspaceId),
  ...(folder.parentId === folder.workspaceId
    ? []
    : folderPathSegments(folder.parentId)),
]

const searchResultGroups = (results: SearchResult[]): SearchResultGroup[] => {
  const folderResults = sortSearchResults(
    results.filter((result): result is FolderSearchResult => result.kind === 'folder'),
  )
  const deckResults = sortSearchResults(
    results.filter((result): result is DeckSearchResult => result.kind === 'deck'),
  )
  const noteResults = sortSearchResults(
    results.filter((result): result is NoteSearchResult => result.kind === 'note'),
  )
  const groups: SearchResultGroup[] = []

  if (folderResults.length > 0) {
    groups.push({ kind: 'folder', results: folderResults })
  }

  if (deckResults.length > 0) {
    groups.push({ kind: 'deck', results: deckResults })
  }

  if (noteResults.length > 0) {
    groups.push({ kind: 'note', results: noteResults })
  }

  return groups
}

const sortSearchResults = <T extends SearchResult>(results: T[]) =>
  results.sort((left, right) => left.title.localeCompare(right.title))

const descendantFolderIds = (folderId: string): string[] => {
  const children = visible(state.folders).filter(
    (folder) => folder.parentId === folderId,
  )

  return children.flatMap((folder) => [folder.id, ...descendantFolderIds(folder.id)])
}

const activeWorkspace = () => {
  const workspaces = visible(state.workspaces)
  const active =
    workspaces.find((workspace) => workspace.id === state.activeWorkspaceId) ??
    workspaces[0] ??
    state.workspaces[0]

  if (active) {
    state.activeWorkspaceId = active.id
  }

  return active
}

const deckDetail = (deck: DeckRecord): DeckDetail => ({
  ...publicDeck(deck),
  ...(state.deckDetails[deck.id] ?? {
    dueToday: deck.dueToday,
    progress: deck.progress,
    totalNotes: deck.totalNotes,
  }),
})

const clozeCardsFromBody = ({
  body,
  currentCards = [],
  idAllocator,
  newCardDueAt,
  newCardReviewedAt,
}: {
  body: string
  currentCards?: ClozeNoteCard[]
  idAllocator: ReturnType<typeof createIdAllocator>
  newCardDueAt: string
  newCardReviewedAt: string
}): ClozeNoteCard[] => {
  const currentByClozeId = new Map(currentCards.map((card) => [card.clozeId, card]))

  return clozeMarkersFromBody(body)
    .map((marker) => {
      const clozeId = marker.clozeId
      const current = currentByClozeId.get(clozeId)

      if (current) {
        return {
          ...current,
          title: marker.text,
        }
      }

      return {
        clozeId,
        dueAt: newCardDueAt,
        id: idAllocator.next('card'),
        progress: 0,
        reviewedAt: newCardReviewedAt,
        status: 'in-progress',
        title: marker.text,
      }
    })
}

const updateReviewedClozeCard = ({
  cardId,
  cards,
  dueAt,
  progress,
  reviewedAt,
  status,
}: {
  cardId: string
  cards: ClozeNoteCard[]
  dueAt: string
  progress: number
  reviewedAt: string
  status: NoteDetail['status']
}): ClozeNoteCard[] =>
  cards.map((card) =>
    card.id === cardId
      ? {
          ...card,
          dueAt,
          progress,
          reviewedAt,
          status,
        }
      : card,
  )

const noteListItem = (note: NoteRecord): NoteListItem => ({
  dueAt: note.dueAt,
  id: note.id,
  kind: note.kind,
  progress: note.progress,
  reviewedAt: note.reviewedAt,
  status: note.status,
  title: note.title,
  updatedAt: note.updatedAt,
})

const noteRef = (note: NoteRecord): NoteRef => ({
  deckId: note.deckId,
  id: note.id,
})

const reviewCardsForNote = (note: NoteRecord): ReviewSchedulerCard[] => {
  const workspaceId = workspaceIdForDeck(note.deckId)

  if (note.kind === 'basic') {
    return [
      {
        back: note.editor.back,
        deckId: note.deckId,
        dueAt: note.dueAt,
        front: note.editor.front,
        id: basicCardId(note.id),
        kind: 'basic',
        noteId: note.id,
        progress: note.progress,
        reviewedAt: note.reviewedAt,
        status: note.status,
        title: note.title,
        workspaceId,
      },
    ]
  }

  return note.cards.map((card) => ({
    body: note.editor.body,
    clozeId: card.clozeId,
    deckId: note.deckId,
    dueAt: card.dueAt,
    id: card.id,
    kind: 'cloze',
    noteId: note.id,
    progress: card.progress,
    reviewedAt: card.reviewedAt,
    status: card.status,
    title: note.title,
    workspaceId,
  }))
}

const listReviewCards = (deckId: string) =>
  visible(state.notes)
    .filter((note) => note.deckId === deckId)
    .flatMap((note) => reviewCardsForNote(note))

const dueReviewCards = (deckId: string) =>
  listReviewCards(deckId)
    .filter((card) => card.dueAt <= isoNow())
    .sort(compareDueCards)

const practiceReviewCards = (deckId: string) =>
  listReviewCards(deckId).sort(comparePracticeCards)

const durationSeconds = (startedAt: string, endedAt: string) =>
  Math.max(0, Math.floor((Date.parse(endedAt) - Date.parse(startedAt)) / 1000))

const reviewSession = (review: ReviewSessionRecord): ReviewSession | undefined =>
  review.mode === 'due' ? dueReviewSession(review) : practiceReviewSession(review)

const dueReviewSession = (review: DueReviewSessionRecord): DueReviewSession => {
  const currentCardId =
    review.status === 'active'
      ? review.cardIds[review.reviewedCards.length]
      : undefined
  const currentCard = currentCardId
    ? listReviewCards(review.deckId).find((card) => card.id === currentCardId)
    : undefined

  return {
    ...(review.completedAt ? { completedAt: review.completedAt } : {}),
    ...(currentCard ? { currentCard: publicReviewCard(currentCard) } : {}),
    deckId: review.deckId,
    durationSeconds: durationSeconds(review.startedAt, review.completedAt ?? isoNow()),
    id: review.id,
    mode: 'due',
    plannedCount: review.cardIds.length,
    reviewedCount: review.reviewedCards.length,
    startedAt: review.startedAt,
    status: review.status,
  }
}

const practiceReviewSession = (
  review: PracticeReviewSessionRecord,
): PracticeReviewSession | undefined => {
  const currentCard = listReviewCards(review.deckId).find(
    (card) => card.id === review.currentCardId,
  )

  return currentCard
    ? {
        currentCard: publicReviewCard(currentCard),
        deckId: review.deckId,
        durationSeconds: durationSeconds(review.startedAt, isoNow()),
        id: review.id,
        mode: 'practice',
        reviewedCount: review.reviewedCards.length,
        startedAt: review.startedAt,
      }
    : undefined
}

const compareDueCards = (left: ReviewSchedulerCard, right: ReviewSchedulerCard) =>
  left.dueAt.localeCompare(right.dueAt) ||
  left.reviewedAt.localeCompare(right.reviewedAt) ||
  left.id.localeCompare(right.id)

const comparePracticeCards = (left: ReviewSchedulerCard, right: ReviewSchedulerCard) =>
  left.reviewedAt.localeCompare(right.reviewedAt) ||
  left.progress - right.progress ||
  left.id.localeCompare(right.id)

export const mockAppDataStore = {
  activeWorkspace,
  reset() {
    Object.assign(state, seedState())
    persist()
  },
  createDeck(draft: DeckDraft) {
    const id = createIdAllocator(state.idCounters).next('deck')
    const workspaceId = workspaceIdForParent(draft.parentId)
    const deck: DeckRecord = {
      ...draft,
      dueToday: 0,
      id,
      progress: 0,
      totalNotes: 0,
      updatedAt: isoNow(),
      workspaceId,
    }

    state.decks = [deck, ...state.decks]
    state.deckDetails = {
      ...state.deckDetails,
      [id]: { dueToday: 0, progress: 0, totalNotes: 0 },
    }
    touchWorkspace(workspaceId)
    persist()

    return publicDeck(deck)
  },
  createFolder(draft: FolderDraft) {
    const id = createIdAllocator(state.idCounters).next('folder')
    const workspaceId = workspaceIdForParentFolder(draft.parentId)
    const folder: FolderRecord = { ...draft, id, updatedAt: isoNow(), workspaceId }

    state.folders = [folder, ...state.folders]
    touchWorkspace(workspaceId)
    persist()

    return publicFolder(folder)
  },
  createNote(draft: NoteDraft) {
    const ids = createIdAllocator(state.idCounters)
    const id = ids.next('note')
    const workspaceId = workspaceIdForDeck(draft.deckId)
    const base = {
      deckId: draft.deckId,
      dueAt: daysFromNow(1),
      id,
      progress: 0,
      reviewedAt: isoNow(),
      status: 'in-progress' as const,
      title: draft.title,
      updatedAt: isoNow(),
    }
    const dueAt = daysFromNow(1)
    const reviewedAt = isoNow()
    const cards =
      draft.kind === 'cloze'
        ? clozeCardsFromBody({
            body: draft.editor.body,
            idAllocator: ids,
            newCardDueAt: dueAt,
            newCardReviewedAt: reviewedAt,
          })
        : []
    const aggregate = aggregateClozeCards(cards, base)
    const note: NoteDetail =
      draft.kind === 'basic'
        ? {
            ...base,
            dueAt,
            editor: draft.editor,
            kind: 'basic',
            reviewedAt,
          }
        : {
            ...base,
            cards,
            dueAt: aggregate.dueAt,
            editor: draft.editor,
            kind: 'cloze',
            progress: aggregate.progress,
            reviewedAt,
            status: aggregate.status,
          }

    state.notes = [note, ...state.notes]
    bumpDeckTotalNotes(draft.deckId, 1)
    touchWorkspace(workspaceId)
    persist()

    return noteRef(note)
  },
  createWorkspace(draft: WorkspaceDraft) {
    const id = createIdAllocator(state.idCounters).next('workspace')
    const workspace: WorkspaceRecord = {
      ...draft,
      id,
      updatedAt: isoNow(),
    }

    state.workspaces = [workspace, ...state.workspaces]
    persist()

    return publicWorkspace(workspace)
  },
  deleteDeck(deckId: string) {
    const deck = state.decks.find((candidate) => candidate.id === deckId)

    if (!deck) {
      return
    }

    state.decks = state.decks.map((candidate) =>
      candidate.id === deckId ? { ...candidate, deletedAt: isoNow() } : candidate,
    )
    addTrashItem({
      deletedAt: isoNow(),
      id: deck.id,
      kind: 'deck',
      locationPath: deckLocationPath(deck),
      title: deck.title,
    })
    touchWorkspace(deck.workspaceId)
    persist()
  },
  deleteFolder(folderId: string) {
    const folder = state.folders.find((candidate) => candidate.id === folderId)

    if (!folder) {
      return
    }

    state.folders = state.folders.map((candidate) =>
      candidate.id === folderId ? { ...candidate, deletedAt: isoNow() } : candidate,
    )
    addTrashItem({
      deletedAt: isoNow(),
      id: folder.id,
      kind: 'folder',
      locationPath: folderContainerLocationPath(folder),
      title: folder.name,
    })
    touchWorkspace(folder.workspaceId)
    persist()
  },
  deleteNote(noteId: string) {
    const note = state.notes.find((candidate) => candidate.id === noteId)
    const deck = note ? state.decks.find((candidate) => candidate.id === note.deckId) : undefined

    if (!note) {
      return
    }

    state.notes = state.notes.map((candidate) =>
      candidate.id === noteId ? { ...candidate, deletedAt: isoNow() } : candidate,
    )
    bumpDeckTotalNotes(note.deckId, -1)
    addTrashItem({
      deletedAt: isoNow(),
      id: note.id,
      kind: 'note',
      locationPath: deck
        ? [...deckLocationPath(deck), deck.title]
        : [note.deckId],
      title: note.title,
    })
    persist()
  },
  deleteWorkspace(workspaceId: string) {
    const workspace = state.workspaces.find((candidate) => candidate.id === workspaceId)

    if (!workspace || visible(state.workspaces).length <= 1) {
      return null
    }

    state.workspaces = state.workspaces.map((candidate) =>
      candidate.id === workspaceId ? { ...candidate, deletedAt: isoNow() } : candidate,
    )
    addTrashItem({
      deletedAt: isoNow(),
      id: workspace.id,
      kind: 'workspace',
      locationPath: ['Workspaces'],
      title: workspace.title,
    })

    const nextWorkspace = activeWorkspace()
    state.activeWorkspaceId =
      nextWorkspace.id === workspaceId
        ? visible(state.workspaces).find((candidate) => candidate.id !== workspaceId)?.id ??
          nextWorkspace.id
        : nextWorkspace.id
    persist()

    return state.activeWorkspaceId
  },
  emptyTrash() {
    state.trash = { items: [], lastEmptiedAt: isoNow() }
    persist()

    return state.trash
  },
  getActiveWorkspaceId() {
    return activeWorkspace().id
  },
  getDeckById(deckId: string) {
    const deck = visible(state.decks).find((candidate) => candidate.id === deckId)

    return deck ? deckDetail(deck) : undefined
  },
  getFolderById(folderId: string) {
    const folder = visible(state.folders).find((candidate) => candidate.id === folderId)

    return folder ? publicFolder(folder) : undefined
  },
  getFolderPath: folderPathSegments,
  getNoteById(_deckId: string, noteId: string) {
    const note = visible(state.notes).find((candidate) => candidate.id === noteId)

    return note ? publicNote(note) : undefined
  },
  getSettings() {
    return state.settings
  },
  getReviewById(reviewId: string) {
    const review = state.reviews.find((candidate) => candidate.id === reviewId)

    return review ? reviewSession(review) : undefined
  },
  getWorkspaceById(workspaceId: string) {
    const workspace = visible(state.workspaces).find(
      (candidate) => candidate.id === workspaceId,
    )

    return workspace ? publicWorkspace(workspace) : undefined
  },
  startReview(deckId: string): ReviewStartResult | undefined {
    const deck = visible(state.decks).find((candidate) => candidate.id === deckId)

    if (!deck) {
      return undefined
    }

    const startedAt = isoNow()
    const dueCards = dueReviewCards(deckId)

    if (dueCards.length > 0) {
      const ids = createIdAllocator(state.idCounters)
      const review: DueReviewSessionRecord = {
        cardIds: dueCards.map((card) => card.id),
        deckId,
        id: ids.next('review'),
        mode: 'due',
        reviewedCards: [],
        startedAt,
        status: 'active',
      }

      state.reviews = [review, ...state.reviews]
      persist()

      return dueReviewSession(review)
    }

    const practiceCard = practiceReviewCards(deckId)[0]

    if (!practiceCard) {
      return {
        mode: 'unavailable',
        reason: 'empty-deck',
      }
    }

    const review: PracticeReviewSessionRecord = {
      currentCardId: practiceCard.id,
      deckId,
      id: createIdAllocator(state.idCounters).next('review'),
      mode: 'practice',
      reviewedCards: [],
      startedAt,
    }

    state.reviews = [review, ...state.reviews]
    persist()

    return practiceReviewSession(review)
  },
  grade(reviewId: string, cardId: string, grade: ReviewGrade): ReviewSession | undefined {
    const review = state.reviews.find((candidate) => candidate.id === reviewId)
    const currentCard = visible(state.notes)
      .flatMap((note) => reviewCardsForNote(note))
      .find((card) => card.id === cardId)

    if (!review || !currentCard || currentCard.deckId !== review.deckId) {
      return undefined
    }

    const note = visible(state.notes).find((candidate) => candidate.id === currentCard.noteId)

    if (!note) {
      return undefined
    }

    const expectedCardId =
      review.mode === 'due'
        ? review.cardIds[review.reviewedCards.length]
        : review.currentCardId

    if (
      expectedCardId !== cardId ||
      (review.mode === 'due' && review.status === 'completed')
    ) {
      return undefined
    }

    const increment = grade === 'again' ? -8 : grade === 'hard' ? 4 : grade === 'good' ? 9 : 14
    const nextDueAt = daysFromNow(
      grade === 'again' ? 1 : grade === 'hard' ? 2 : grade === 'good' ? 4 : 7,
    )
    const nextProgress = Math.max(0, Math.min(100, currentCard.progress + increment))
    const nextReviewedAt = isoNow()
    const nextStatus = nextProgress >= 80 ? 'mastered' : 'in-progress'

    if (note.kind === 'basic') {
      state.notes = state.notes.map((candidate) =>
        candidate.id === note.id
          ? {
              ...candidate,
              dueAt: nextDueAt,
              progress: nextProgress,
              reviewedAt: nextReviewedAt,
              status: nextStatus,
              updatedAt: nextReviewedAt,
            }
          : candidate,
      )
    } else {
      const cards = updateReviewedClozeCard({
        cardId,
        cards: note.cards,
        dueAt: nextDueAt,
        progress: nextProgress,
        reviewedAt: nextReviewedAt,
        status: nextStatus,
      })
      const aggregate = aggregateClozeCards(cards, note)

      state.notes = state.notes.map((candidate) => {
        if (candidate.id !== note.id || candidate.kind !== 'cloze') {
          return candidate
        }

        return {
          ...candidate,
          cards,
          dueAt: aggregate.dueAt,
          progress: aggregate.progress,
          reviewedAt: aggregate.reviewedAt,
          status: aggregate.status,
          updatedAt: nextReviewedAt,
        }
      })
    }

    state.reviews = state.reviews.map((candidate) => {
      if (candidate.id !== review.id) {
        return candidate
      }

      const reviewedCards = [
        ...candidate.reviewedCards,
        {
          cardId,
          grade,
          noteId: note.id,
          reviewedAt: nextReviewedAt,
        },
      ]

      if (candidate.mode === 'due') {
        return {
          ...candidate,
          ...(reviewedCards.length >= candidate.cardIds.length
            ? { completedAt: nextReviewedAt, status: 'completed' as const }
            : {}),
          reviewedCards,
        }
      }

      return {
        ...candidate,
        currentCardId: practiceReviewCards(candidate.deckId)[0]?.id ?? candidate.currentCardId,
        reviewedCards,
      }
    })
    persist()

    return mockAppDataStore.getReviewById(review.id)
  },
  listDecksInFolder(folderId: string, sort?: SortPreference) {
    return sortByPreference(
      visible(state.decks).filter(
        (deck) => deck.parentId === folderId,
      ),
      sort,
    ).map(publicDeck)
  },
  listFoldersInFolder(folderId: string, sort?: SortPreference) {
    return sortByPreference(
      visible(state.folders).filter(
        (folder) => folder.parentId === folderId,
      ),
      sort,
    ).map(publicFolder)
  },
  listWorkspaceDecks(workspaceId: string, sort?: SortPreference) {
    return sortByPreference(
      visible(state.decks).filter(
        (deck) => deck.workspaceId === workspaceId && deck.parentId === workspaceId,
      ),
      sort,
    ).map(publicDeck)
  },
  listWorkspaceFolders(workspaceId: string, sort?: SortPreference) {
    return sortByPreference(
      visible(state.folders).filter(
        (folder) => folder.workspaceId === workspaceId && folder.parentId === workspaceId,
      ),
      sort,
    ).map(publicFolder)
  },
  listNotes(deckId: string, sort?: SortPreference) {
    const notes = visible(state.notes).filter((note) => note.deckId === deckId)
    const sortedNotes = sort ? sortByPreference(notes, sort) : notes

    return sortedNotes.map(noteListItem)
  },
  listReviewCards(deckId: string) {
    return listReviewCards(deckId).map(publicReviewCard)
  },
  listTrash() {
    return state.trash
  },
  listWorkspaces() {
    activeWorkspace()

    return visible(state.workspaces).map(publicWorkspace)
  },
  resetSettings() {
    const settings = defaultSettings()
    state.settings = settings
    persist()

    return settings
  },
  restoreTrashItem(itemId: string) {
    const item = state.trash.items.find((candidate) => candidate.id === itemId)

    if (!item) {
      return
    }

    if (item.kind === 'workspace') {
      state.workspaces = state.workspaces.map((workspace) =>
        workspace.id === itemId ? { ...workspace, deletedAt: undefined } : workspace,
      )
    }
    if (item.kind === 'folder') {
      state.folders = state.folders.map((folder) =>
        folder.id === itemId ? { ...folder, deletedAt: undefined } : folder,
      )
    }
    if (item.kind === 'deck') {
      state.decks = state.decks.map((deck) =>
        deck.id === itemId ? { ...deck, deletedAt: undefined } : deck,
      )
    }
    if (item.kind === 'note') {
      const note = state.notes.find((candidate) => candidate.id === itemId)

      state.notes = state.notes.map((note) =>
        note.id === itemId ? { ...note, deletedAt: undefined } : note,
      )
      if (note) {
        bumpDeckTotalNotes(note.deckId, 1)
      }
    }

    state.trash = {
      ...state.trash,
      items: state.trash.items.filter((candidate) => candidate.id !== itemId),
    }
    persist()
  },
  deleteTrashItem(itemId: string) {
    state.trash = {
      ...state.trash,
      items: state.trash.items.filter((item) => item.id !== itemId),
    }
    persist()
  },
  search(scope: SearchScope, query: string) {
    const normalized = query.trim().toLowerCase()

    if (!normalized) {
      return [] as SearchResultGroup[]
    }

    const folderIds =
      scope.kind === 'folder' ? new Set([scope.folderId, ...descendantFolderIds(scope.folderId)]) : null

    const folders =
      scope.kind === 'deck'
        ? []
        : visible(state.folders).filter((folder) => {
            const inScope =
              scope.kind === 'workspace'
                ? folder.workspaceId === scope.workspaceId
                : folderIds?.has(folder.id)
            return inScope && folder.name.toLowerCase().includes(normalized)
          })
    const decks =
      scope.kind === 'deck'
        ? []
        : visible(state.decks).filter((deck) => {
            const inScope =
              scope.kind === 'workspace'
                ? deck.workspaceId === scope.workspaceId
                : (folderIds?.has(deck.parentId) ?? false)
            return inScope && deck.title.toLowerCase().includes(normalized)
          })
    const notes = visible(state.notes).flatMap((note) => {
      const deck = state.decks.find((candidate) => candidate.id === note.deckId)

      if (!deck) {
        return []
      }

      if (scope.kind === 'deck') {
        return note.deckId === scope.deckId && noteSearchText(note).includes(normalized)
          ? [{ deck, note }]
          : []
      }

      const inScope =
        scope.kind === 'workspace'
          ? deck.workspaceId === scope.workspaceId
          : (folderIds?.has(deck.parentId) ?? false)

      return inScope && noteSearchText(note).includes(normalized) ? [{ deck, note }] : []
    })

    return searchResultGroups([
      ...folders.map<FolderSearchResult>((folder) => ({
        id: folder.id,
        kind: 'folder',
        locationPath: folderContainerLocationPath(folder),
        title: folder.name,
        updatedAt: folder.updatedAt,
        workspaceId: folder.workspaceId,
      })),
      ...decks.map<DeckSearchResult>((deck) => ({
        deckIcon: deck.icon,
        id: deck.id,
        kind: 'deck',
        locationPath: deckLocationPath(deck),
        title: deck.title,
        updatedAt: deck.updatedAt,
        workspaceId: deck.workspaceId,
      })),
      ...notes.map<NoteSearchResult>(({ deck, note }) => ({
        deckId: note.deckId,
        id: note.id,
        kind: 'note',
        locationPath: deckLocationPath(deck),
        noteKind: note.kind,
        title: note.title,
        updatedAt: note.updatedAt,
        workspaceId: deck.workspaceId,
      })),
    ])
  },
  setActiveWorkspaceId(workspaceId: string) {
    if (state.activeWorkspaceId === workspaceId) {
      return
    }

    state.activeWorkspaceId = workspaceId
    persist()
  },
  updateDeck(deckId: string, draft: DeckDraft) {
    const current = state.decks.find((deck) => deck.id === deckId)

    if (!current) {
      return undefined
    }

    const workspaceId = workspaceIdForParent(draft.parentId)
    const next = {
      ...current,
      ...draft,
      updatedAt: isoNow(),
      workspaceId,
    }

    state.decks = state.decks.map((deck) => (deck.id === deckId ? next : deck))
    touchWorkspace(workspaceId)
    if (current.workspaceId !== workspaceId) {
      touchWorkspace(current.workspaceId)
    }
    persist()

    return deckDetail(next)
  },
  updateFolder(folderId: string, draft: FolderDraft) {
    const current = state.folders.find((folder) => folder.id === folderId)

    if (!current) {
      return undefined
    }

    const workspaceId = workspaceIdForParentFolder(draft.parentId)
    const next = {
      ...current,
      ...draft,
      updatedAt: isoNow(),
      workspaceId,
    }

    state.folders = state.folders.map((folder) => (folder.id === folderId ? next : folder))
    touchWorkspace(workspaceId)
    if (current.workspaceId !== workspaceId) {
      touchWorkspace(current.workspaceId)
    }
    persist()

    return next
  },
  updateNote(noteId: string, draft: NoteDraft) {
    const current = state.notes.find((note) => note.id === noteId)

    if (!current) {
      return undefined
    }

    const workspaceId = workspaceIdForDeck(draft.deckId)
    const dueAt = current.dueAt
    const ids = createIdAllocator(state.idCounters)
    const cards =
      draft.kind === 'cloze'
        ? clozeCardsFromBody({
            body: draft.editor.body,
            currentCards: current.kind === 'cloze' ? current.cards : [],
            idAllocator: ids,
            newCardDueAt: daysFromNow(1),
            newCardReviewedAt: isoNow(),
          })
        : []
    const aggregate = aggregateClozeCards(cards, {
      ...current,
      progress: 0,
      status: 'in-progress',
    })
    const next: NoteRecord =
      draft.kind === 'basic'
        ? {
            deckId: draft.deckId,
            deletedAt: current.deletedAt,
            dueAt,
            editor: draft.editor,
            id: current.id,
            kind: 'basic',
            progress: current.progress,
            reviewedAt: current.reviewedAt,
            status: current.status,
            title: draft.title,
            updatedAt: isoNow(),
          }
        : {
            cards,
            deckId: draft.deckId,
            deletedAt: current.deletedAt,
            dueAt: aggregate.dueAt,
            editor: draft.editor,
            id: current.id,
            kind: 'cloze',
            progress: aggregate.progress,
            reviewedAt: aggregate.reviewedAt,
            status: aggregate.status,
            title: draft.title,
            updatedAt: isoNow(),
          }

    state.notes = state.notes.map((note) => (note.id === noteId ? next : note))
    if (current.deckId !== draft.deckId) {
      bumpDeckTotalNotes(current.deckId, -1)
      bumpDeckTotalNotes(draft.deckId, 1)
    }
    touchWorkspace(workspaceId)
    const currentWorkspaceId = workspaceIdForDeck(current.deckId)
    if (currentWorkspaceId !== workspaceId) {
      touchWorkspace(currentWorkspaceId)
    }
    persist()

    return noteRef(next)
  },
  updateWorkspace(workspaceId: string, draft: WorkspaceDraft) {
    const current = state.workspaces.find((workspace) => workspace.id === workspaceId)
    const next = current
      ? {
          ...current,
          ...draft,
          updatedAt: isoNow(),
        }
      : undefined

    if (!next) {
      return undefined
    }

    state.workspaces = state.workspaces.map((workspace) =>
      workspace.id === workspaceId ? next : workspace,
    )
    persist()

    return next
  },
  writeSettings(settings: Settings) {
    state.settings = settings
    persist()

    return settings
  },
}

export { defaultSettings }
