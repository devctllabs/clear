import type {
  DeckSearchResult,
  DeckSearchResultGroup,
  FolderSearchResult,
  FolderSearchResultGroup,
  NoteSearchResult,
  NoteSearchResultGroup,
  SearchResult,
  SearchResultGroup,
} from '@features/content-search/types/search.types'
import type { Deck, DeckDetail } from '@features/decks/types/deck.types'
import type { Folder } from '@features/folders/types/folder.types'
import type {
  BasicNote,
  ClozeNote,
} from '@features/notes/types/note.types'
import type {
  BasicReviewCard,
  ClozeReviewCard,
} from '@features/review/types/review.types'

export const secondMs = 1000
export const minuteMs = 60 * secondMs
export const hourMs = 60 * minuteMs
export const dayMs = 24 * hourMs

export const timestampAgo = (durationMs: number) =>
  new Date(Date.now() - durationMs).toISOString()

export const baseDeck: Deck = {
  description: 'High-yield review cards for daily study.',
  dueToday: 18,
  icon: 'book-open',
  id: 'world-history',
  parentId: 'independent-study',
  progress: 72,
  title: 'World History',
  totalNotes: 145,
  updatedAt: timestampAgo(4 * hourMs),
  workspaceId: 'independent-study',
}

export const createDeck = (deck: Partial<Deck> = {}): Deck => ({
  ...baseDeck,
  ...deck,
})

export const baseDeckDetail: DeckDetail = createDeck()

export const createDeckDetail = (deck: Partial<DeckDetail> = {}): DeckDetail => ({
  ...baseDeckDetail,
  ...deck,
})

export const baseFolder: Folder = {
  description: 'Core study material organized by topic.',
  id: 'reading-notes',
  name: 'Reading Notes',
  parentId: 'independent-study',
  updatedAt: timestampAgo(2 * dayMs),
  workspaceId: 'independent-study',
}

export const createFolder = (folder: Partial<Folder> = {}): Folder => ({
  ...baseFolder,
  ...folder,
})

export const baseBasicNoteDetail: BasicNote = {
  deckId: baseDeck.id,
  dueAt: timestampAgo(-2 * dayMs),
  editor: {
    back: 'Corroboration compares independent sources to test whether an account is reliable.',
    front: 'Which practice checks a source against independent evidence?',
  },
  id: 'source-corroboration-basic',
  kind: 'basic',
  progress: 46,
  reviewedAt: timestampAgo(6 * dayMs),
  status: 'in-progress',
  title: 'Source Corroboration',
  updatedAt: timestampAgo(45 * minuteMs),
}

export const createBasicNoteDetail = (
  note: Partial<BasicNote> = {},
): BasicNote => ({
  ...baseBasicNoteDetail,
  ...note,
})

export const baseClozeNoteDetail: ClozeNote = {
  cards: [
    {
      clozeId: 'c1',
      dueAt: timestampAgo(-1 * dayMs),
      id: 'collective-memory-cloze:c1',
      progress: 82,
      reviewedAt: timestampAgo(1 * dayMs),
      status: 'mastered',
      title: 'public narratives',
    },
  ],
  deckId: baseDeck.id,
  dueAt: timestampAgo(-1 * dayMs),
  editor: {
    body: 'Collective memory preserves {{c1::public narratives}} through monuments, archives, and ceremonies.',
  },
  id: 'collective-memory-cloze',
  kind: 'cloze',
  progress: 82,
  reviewedAt: timestampAgo(1 * dayMs),
  status: 'mastered',
  title: 'Collective Memory Cloze',
  updatedAt: timestampAgo(6 * hourMs),
}

export const createClozeNoteDetail = (
  note: Partial<ClozeNote> = {},
): ClozeNote => ({
  ...baseClozeNoteDetail,
  ...note,
})

export const baseBasicReviewCard: BasicReviewCard = {
  back: baseBasicNoteDetail.editor.back,
  front: baseBasicNoteDetail.editor.front,
  id: `${baseBasicNoteDetail.id}:basic`,
  kind: 'basic',
  progress: baseBasicNoteDetail.progress,
}

export const baseClozeReviewCard: ClozeReviewCard = {
  body: baseClozeNoteDetail.editor.body,
  clozeId: baseClozeNoteDetail.cards[0].clozeId,
  id: baseClozeNoteDetail.cards[0].id,
  kind: 'cloze',
  progress: baseClozeNoteDetail.cards[0].progress,
}

export const createBasicReviewCard = (
  card: Partial<BasicReviewCard> = {},
): BasicReviewCard => ({
  ...baseBasicReviewCard,
  ...card,
})

export const createClozeReviewCard = (
  card: Partial<ClozeReviewCard> = {},
): ClozeReviewCard => ({
  ...baseClozeReviewCard,
  ...card,
})

type SearchResultOverride =
  | ({ kind?: 'deck' } & Partial<DeckSearchResult>)
  | ({ kind: 'folder' } & Partial<FolderSearchResult>)
  | ({ kind: 'note' } & Partial<NoteSearchResult>)

export function createSearchResult(
  result: { kind: 'folder' } & Partial<FolderSearchResult>,
): FolderSearchResult
export function createSearchResult(
  result: { kind: 'note' } & Partial<NoteSearchResult>,
): NoteSearchResult
export function createSearchResult(
  result?: { kind?: 'deck' } & Partial<DeckSearchResult>,
): DeckSearchResult
export function createSearchResult(result: SearchResultOverride = {}): SearchResult {
  if (result.kind === 'folder') {
    return {
      ...result,
      id: result.id ?? 'reading-notes',
      kind: 'folder',
      locationPath: result.locationPath ?? ['Independent Study'],
      title: result.title ?? 'Reading Notes',
      updatedAt: result.updatedAt ?? timestampAgo(2 * dayMs),
      workspaceId: result.workspaceId ?? baseFolder.workspaceId,
    }
  }

  if (result.kind === 'note') {
    return {
      ...result,
      id: result.id ?? baseBasicNoteDetail.id,
      kind: 'note',
      noteKind: result.noteKind ?? baseBasicNoteDetail.kind,
      deckId: result.deckId ?? baseBasicNoteDetail.deckId,
      locationPath: result.locationPath ?? [
        'Independent Study',
        'Reading Notes',
        'World History',
      ],
      title: result.title ?? baseBasicNoteDetail.title,
      updatedAt: result.updatedAt ?? timestampAgo(45 * minuteMs),
      workspaceId: result.workspaceId ?? baseDeck.workspaceId,
    }
  }

  return {
    ...result,
    id: result.id ?? 'world-history',
    kind: 'deck',
    deckIcon: result.deckIcon ?? 'book-open',
    locationPath: result.locationPath ?? ['Independent Study', 'Reading Notes'],
    title: result.title ?? 'World History',
    updatedAt: result.updatedAt ?? timestampAgo(4 * hourMs),
    workspaceId: result.workspaceId ?? baseDeck.workspaceId,
  }
}

type SearchGroupOverride =
  | ({ kind: 'deck' } & Partial<DeckSearchResultGroup>)
  | ({ kind: 'folder' } & Partial<FolderSearchResultGroup>)
  | ({ kind: 'note' } & Partial<NoteSearchResultGroup>)

export const createSearchGroup = (group: SearchGroupOverride): SearchResultGroup => {
  if (group.kind === 'folder') {
    return {
      results: [],
      ...group,
    }
  }

  if (group.kind === 'note') {
    return {
      results: [],
      ...group,
    }
  }

  return {
    results: [],
    ...group,
  }
}

export const noop = () => undefined
