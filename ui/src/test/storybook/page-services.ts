import { DEFAULT_SETTINGS } from '@local/mock-server/browser'

import type { ContentSearchService } from '@features/content-search/services/contentSearchService'
import type { BootstrapService } from '@features/bootstrap'
import type { SearchResultGroup } from '@features/content-search/types/search.types'
import type { DeckService } from '@features/decks/services/deckService'
import type { Deck, DeckDetail, DeckDraft } from '@features/decks/types/deck.types'
import type { FolderService } from '@features/folders/services/folderService'
import type { Folder, FolderDraft } from '@features/folders/types/folder.types'
import type { NoteService } from '@features/notes/services/noteService'
import type {
  NoteDetail,
  NoteDraft,
  NoteListItem,
  NoteRef,
} from '@features/notes/types/note.types'
import type { ReviewService } from '@features/review/services/reviewService'
import type {
  DueReviewSession,
  PracticeReviewSession,
  ReviewCard,
  ReviewSession,
} from '@features/review/types/review.types'
import type { SettingsService } from '@features/settings/services/settingsService'
import type { Settings } from '@features/settings/types/settings.types'
import type { TrashService } from '@features/trash/services/trashService'
import type { TrashItem, TrashState } from '@features/trash/types/trash.types'
import type { WorkspaceService } from '@features/workspaces/services/workspaceService'
import type {
  Workspace,
  WorkspaceDraft,
  WorkspaceListResult,
} from '@features/workspaces/types/workspace.types'
import { createAppServices, type AppServices } from '@core/services'
import { domainError, err, ok, type DomainError, type DomainResult } from '@shared/errors'
import {
  createBootstrapResult,
  type BootstrapResult,
  type RuntimeProfile,
} from '@shared/lib/runtime-profile'
import {
  defaultSortPreference,
  type SortPreference,
} from '@shared/types/sort.types'

import {
  baseBasicNoteDetail,
  baseDeck,
  baseFolder,
  createBasicNoteDetail,
  createBasicReviewCard,
  createDeck,
  createFolder,
  dayMs,
  hourMs,
  timestampAgo,
} from './fixtures'

export const pendingDomainResult = <T>(): DomainResult<T> =>
  new Promise(() => undefined)

export const unavailableError = (message = 'The service is temporarily unavailable.') =>
  domainError.unavailable(message)

export const createStorybookServices = (
  overrides: Partial<AppServices> = {},
): AppServices => ({
  ...createAppServices('mock'),
  ...overrides,
})

export const createBootstrapService = ({
  error,
  loading = false,
  runtimeProfile = { formFactor: 'desktop', runtime: 'web' },
}: {
  error?: DomainError
  loading?: boolean
  runtimeProfile?: RuntimeProfile
} = {}): BootstrapService => ({
  async bootstrap() {
    if (loading) {
      return pendingDomainResult<BootstrapResult>()
    }

    if (error) {
      return err(error)
    }

    return ok(createBootstrapResult(runtimeProfile))
  },
})

export const createWorkspace = (workspace: Partial<Workspace> = {}): Workspace => ({
  description: 'Reading notes, review decks, and reference material for ongoing study.',
  icon: 'layers-3',
  id: 'independent-study',
  title: 'Independent Study',
  updatedAt: timestampAgo(3 * hourMs),
  ...workspace,
})

export const createTrashItem = (item: Partial<TrashItem> = {}): TrashItem => ({
  deletedAt: timestampAgo(2 * dayMs),
  id: 'world-history',
  kind: 'deck',
  locationPath: ['Independent Study', 'Reading Notes'],
  title: 'World History',
  ...item,
})

export const createSettings = (settings: Partial<Settings> = {}): Settings => ({
  ...(structuredClone(DEFAULT_SETTINGS) as Settings),
  ...settings,
})

const sortByPreference = <
  T extends { dueToday?: number; name?: string; title?: string; updatedAt: string },
>(
  items: readonly T[],
  sort: SortPreference = defaultSortPreference,
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

const toNoteListItem = (note: NoteDetail): NoteListItem => ({
  dueAt: note.dueAt,
  id: note.id,
  kind: note.kind,
  progress: note.progress,
  reviewedAt: note.reviewedAt,
  status: note.status,
  title: note.title,
  updatedAt: note.updatedAt,
})

const toNoteRef = (note: NoteDetail): NoteRef => ({
  deckId: note.deckId,
  id: note.id,
})

export const createWorkspaceService = ({
  activeWorkspaceId,
  error,
  loading = false,
  mutationError,
  mutationLoading = false,
  workspaces = [createWorkspace()],
}: {
  activeWorkspaceId?: string
  error?: DomainError
  loading?: boolean
  mutationError?: DomainError
  mutationLoading?: boolean
  workspaces?: Workspace[]
} = {}): WorkspaceService => {
  let currentActiveWorkspaceId =
    activeWorkspaceId ?? workspaces[0]?.id ?? ''
  let workspaceRecords = workspaces

  const visibleWorkspaces = () => workspaceRecords

  const fallbackWorkspace = (workspaceId: string) =>
    createWorkspace({
      id: workspaceId,
      title: workspaceId || 'Workspace',
    })

  return {
    async create(draft: WorkspaceDraft) {
      if (mutationLoading) {
        return pendingDomainResult<Workspace>()
      }

      if (mutationError) {
        return err(mutationError)
      }

      const workspace = createWorkspace({
        ...draft,
        id: draft.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'workspace',
        updatedAt: new Date().toISOString(),
      })

      workspaceRecords = [workspace, ...workspaceRecords]

      return ok(workspace)
    },
    async delete(workspaceId: string) {
      if (mutationLoading) {
        return pendingDomainResult<string | null>()
      }

      if (mutationError) {
        return err(mutationError)
      }

      workspaceRecords = workspaceRecords.filter((workspace) => workspace.id !== workspaceId)
      if (currentActiveWorkspaceId === workspaceId) {
        currentActiveWorkspaceId = workspaceRecords[0]?.id ?? ''
      }

      return ok(currentActiveWorkspaceId || null)
    },
    async getActiveId() {
      if (loading) {
        return pendingDomainResult<string>()
      }

      if (error) {
        return err(error)
      }

      return ok(currentActiveWorkspaceId || 'independent-study')
    },
    async getById(workspaceId: string) {
      if (loading) {
        return pendingDomainResult<Workspace>()
      }

      if (error) {
        return err(error)
      }

      return (
        ok(
          visibleWorkspaces().find((workspace) => workspace.id === workspaceId) ??
            fallbackWorkspace(workspaceId),
        )
      )
    },
    async list() {
      if (loading) {
        return pendingDomainResult<WorkspaceListResult>()
      }

      if (error) {
        return err(error)
      }

      return ok({
        activeWorkspaceId: currentActiveWorkspaceId || null,
        workspaces: visibleWorkspaces(),
      })
    },
    async setActiveId(workspaceId: string) {
      if (mutationLoading) {
        return pendingDomainResult<void>()
      }

      if (mutationError) {
        return err(mutationError)
      }

      currentActiveWorkspaceId = workspaceId

      return ok(undefined)
    },
    async update(workspaceId: string, draft: WorkspaceDraft) {
      if (mutationLoading) {
        return pendingDomainResult<Workspace>()
      }

      if (mutationError) {
        return err(mutationError)
      }

      let updatedWorkspace = fallbackWorkspace(workspaceId)

      workspaceRecords = workspaceRecords.map((workspace) => {
        if (workspace.id !== workspaceId) {
          return workspace
        }

        updatedWorkspace = {
          ...workspace,
          ...draft,
          updatedAt: new Date().toISOString(),
        }

        return updatedWorkspace
      })

      return ok(updatedWorkspace)
    },
  }
}

export const createTrashService = ({
  error,
  loading = false,
  mutationError,
  mutationLoading = false,
  state = {
    items: [
      createTrashItem({
        deletedAt: timestampAgo(5 * dayMs),
        id: 'drafting-patterns',
        kind: 'deck',
        title: 'Drafting Patterns',
      }),
      createTrashItem({
        deletedAt: timestampAgo(2 * dayMs),
        id: 'sampling-error-notes',
        kind: 'note',
        locationPath: ['Independent Study', 'Reference', 'Statistics Basics'],
        title: 'Sampling Error Notes',
      }),
      createTrashItem({
        deletedAt: timestampAgo(7 * dayMs),
        id: 'drafts',
        kind: 'folder',
        locationPath: ['Independent Study'],
        title: 'Drafts',
      }),
    ],
    lastEmptiedAt: timestampAgo(12 * dayMs),
  },
}: {
  error?: DomainError
  loading?: boolean
  mutationError?: DomainError
  mutationLoading?: boolean
  state?: TrashState
} = {}): TrashService => {
  let trashState = {
    ...state,
    items: [...state.items],
  }

  return {
    async deleteItem(itemId: string) {
      if (mutationLoading) {
        return pendingDomainResult<void>()
      }

      if (mutationError) {
        return err(mutationError)
      }

      trashState = {
        ...trashState,
        items: trashState.items.filter((item) => item.id !== itemId),
      }

      return ok(undefined)
    },
    async empty() {
      if (mutationLoading) {
        return pendingDomainResult<TrashState>()
      }

      if (mutationError) {
        return err(mutationError)
      }

      trashState = { items: [], lastEmptiedAt: new Date().toISOString() }

      return ok(trashState)
    },
    async list() {
      if (loading) {
        return pendingDomainResult<TrashState>()
      }

      if (error) {
        return err(error)
      }

      return ok(trashState)
    },
    async restoreItem(itemId: string) {
      if (mutationLoading) {
        return pendingDomainResult<void>()
      }

      if (mutationError) {
        return err(mutationError)
      }

      trashState = {
        ...trashState,
        items: trashState.items.filter((item) => item.id !== itemId),
      }

      return ok(undefined)
    },
  }
}

export const createSettingsService = ({
  error,
  loading = false,
  mutationError,
  mutationLoading = false,
  settings = createSettings(),
}: {
  error?: DomainError
  loading?: boolean
  mutationError?: DomainError
  mutationLoading?: boolean
  settings?: Settings
} = {}): SettingsService => {
  let currentSettings = settings
  const defaults = createSettings()

  return {
    async getDefaults() {
      return ok(defaults)
    },
    async read() {
      if (loading) {
        return pendingDomainResult<Settings>()
      }

      if (error) {
        return err(error)
      }

      return ok(currentSettings)
    },
    async reset() {
      if (mutationLoading) {
        return pendingDomainResult<Settings>()
      }

      if (mutationError) {
        return err(mutationError)
      }

      currentSettings = defaults

      return ok(currentSettings)
    },
    async write(nextSettings: Settings) {
      if (mutationLoading) {
        return pendingDomainResult<Settings>()
      }

      if (mutationError) {
        return err(mutationError)
      }

      currentSettings = nextSettings

      return ok(currentSettings)
    },
  }
}

export const createContentSearchService = ({
  error,
  groups = [],
  loading = false,
}: {
  error?: DomainError
  groups?: SearchResultGroup[]
  loading?: boolean
} = {}): ContentSearchService => ({
  async search() {
    if (loading) {
      return pendingDomainResult<SearchResultGroup[]>()
    }

    if (error) {
      return err(error)
    }

    return ok(groups)
  },
})

export const createFolderService = ({
  error,
  folderPaths = {
    [baseFolder.id]: ['Reading Notes'],
  },
  folders = [baseFolder],
  listRefreshError,
  loading = false,
  mutationError,
  mutationLoading = false,
  pathError,
}: {
  error?: DomainError
  folderPaths?: Record<string, string[]>
  folders?: Folder[]
  listRefreshError?: DomainError
  loading?: boolean
  mutationError?: DomainError
  mutationLoading?: boolean
  pathError?: DomainError
} = {}): FolderService => {
  let folderRecords = folders
  let listCallCount = 0
  const workspaceIdForParent = (parentId: string) =>
    folderRecords.find((folder) => folder.id === parentId)?.workspaceId ??
    parentId
  const listFolders = async (
    predicate: (folder: Folder) => boolean,
    sort?: SortPreference,
  ): DomainResult<Folder[]> => {
    if (loading) {
      return pendingDomainResult<Folder[]>()
    }

    if (error) {
      return err(error)
    }

    if (listRefreshError && listCallCount > 0) {
      return err(listRefreshError)
    }

    listCallCount += 1

    return ok(sortByPreference(folderRecords.filter(predicate), sort))
  }

  return {
    async create(draft: FolderDraft) {
      if (mutationLoading) {
        return pendingDomainResult<Folder>()
      }

      if (mutationError) {
        return err(mutationError)
      }

      const folder = createFolder({
        ...draft,
        id: draft.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'folder',
        updatedAt: new Date().toISOString(),
        workspaceId: workspaceIdForParent(draft.parentId),
      })

      folderRecords = [folder, ...folderRecords]

      return ok(folder)
    },
    async delete(folderId: string) {
      if (mutationLoading) {
        return pendingDomainResult<void>()
      }

      if (mutationError) {
        return err(mutationError)
      }

      folderRecords = folderRecords.filter((folder) => folder.id !== folderId)

      return ok(undefined)
    },
    async getById(folderId: string) {
      if (loading) {
        return pendingDomainResult<Folder>()
      }

      if (error) {
        return err(error)
      }

      return ok(
        folderRecords.find((folder) => folder.id === folderId) ??
          createFolder({ id: folderId, name: 'Folder' }),
      )
    },
    async getPath(folderId: string) {
      if (pathError) {
        return err(pathError)
      }

      if (error) {
        return err(error)
      }

      return ok(folderPaths[folderId] ?? ['Workspace'])
    },
    async listFolderChildren(folderId: string, sort?: SortPreference) {
      return listFolders((folder) => folder.parentId === folderId, sort)
    },
    async listWorkspaceRoot(workspaceId: string, sort?: SortPreference) {
      return listFolders(
        (folder) => folder.workspaceId === workspaceId && folder.parentId === workspaceId,
        sort,
      )
    },
    async update(folderId: string, draft: FolderDraft) {
      if (mutationLoading) {
        return pendingDomainResult<Folder>()
      }

      if (mutationError) {
        return err(mutationError)
      }

      let updatedFolder = createFolder({
        ...draft,
        id: folderId,
        workspaceId: workspaceIdForParent(draft.parentId),
      })

      folderRecords = folderRecords.map((folder) => {
        if (folder.id !== folderId) {
          return folder
        }

        updatedFolder = {
          ...folder,
          ...draft,
          updatedAt: new Date().toISOString(),
          workspaceId: workspaceIdForParent(draft.parentId),
        }

        return updatedFolder
      })

      return ok(updatedFolder)
    },
  }
}

export const createDeckService = ({
  error,
  deckDetails = {
    [baseDeck.id]: baseDeck,
  },
  decks = [baseDeck],
  listRefreshError,
  loading = false,
  mutationError,
  mutationLoading = false,
}: {
  error?: DomainError
  deckDetails?: Record<string, DeckDetail>
  decks?: Deck[]
  listRefreshError?: DomainError
  loading?: boolean
  mutationError?: DomainError
  mutationLoading?: boolean
} = {}): DeckService => {
  let deckRecords = decks
  let listCallCount = 0
  const workspaceIdForParent = (parentId: string) =>
    deckRecords.find((deck) => deck.parentId === parentId)?.workspaceId ??
    (parentId === baseDeck.workspaceId ? parentId : baseDeck.workspaceId)
  const listDecks = async (
    predicate: (deck: Deck) => boolean,
    sort?: SortPreference,
  ): DomainResult<Deck[]> => {
    if (loading) {
      return pendingDomainResult<Deck[]>()
    }

    if (error) {
      return err(error)
    }

    if (listRefreshError && listCallCount > 0) {
      return err(listRefreshError)
    }

    listCallCount += 1

    return ok(sortByPreference(deckRecords.filter(predicate), sort))
  }

  return {
    async create(draft: DeckDraft) {
      if (mutationLoading) {
        return pendingDomainResult<Deck>()
      }

      if (mutationError) {
        return err(mutationError)
      }

      const deck = createDeck({
        ...draft,
        dueToday: 0,
        id: draft.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'deck',
        progress: 0,
        totalNotes: 0,
        updatedAt: new Date().toISOString(),
        workspaceId: workspaceIdForParent(draft.parentId),
      })

      deckRecords = [deck, ...deckRecords]

      return ok(deck)
    },
    async delete(deckId: string) {
      if (mutationLoading) {
        return pendingDomainResult<void>()
      }

      if (mutationError) {
        return err(mutationError)
      }

      deckRecords = deckRecords.filter((deck) => deck.id !== deckId)

      return ok(undefined)
    },
    async getById(deckId: string) {
      if (loading) {
        return pendingDomainResult<DeckDetail>()
      }

      if (error) {
        return err(error)
      }

      return ok(deckDetails[deckId] ?? deckRecords.find((deck) => deck.id === deckId) ?? baseDeck)
    },
    async listFolderChildren(folderId: string, sort?: SortPreference) {
      return listDecks((deck) => deck.parentId === folderId, sort)
    },
    async listWorkspaceRoot(workspaceId: string, sort?: SortPreference) {
      return listDecks(
        (deck) => deck.workspaceId === workspaceId && deck.parentId === workspaceId,
        sort,
      )
    },
    async update(deckId: string, draft: DeckDraft) {
      if (mutationLoading) {
        return pendingDomainResult<Deck>()
      }

      if (mutationError) {
        return err(mutationError)
      }

      let updatedDeck = createDeck({
        ...draft,
        id: deckId,
        workspaceId: workspaceIdForParent(draft.parentId),
      })

      deckRecords = deckRecords.map((deck) => {
        if (deck.id !== deckId) {
          return deck
        }

        updatedDeck = {
          ...deck,
          ...draft,
          updatedAt: new Date().toISOString(),
          workspaceId: workspaceIdForParent(draft.parentId),
        }

        return updatedDeck
      })

      return ok(updatedDeck)
    },
  }
}

export const createNoteService = ({
  error,
  noteDetails = [baseBasicNoteDetail],
  listRefreshError,
  loading = false,
  mutationError,
  mutationLoading = false,
}: {
  error?: DomainError
  noteDetails?: NoteDetail[]
  listRefreshError?: DomainError
  loading?: boolean
  mutationError?: DomainError
  mutationLoading?: boolean
} = {}): NoteService => {
  let noteRecords = noteDetails
  let listCallCount = 0

  return {
    async create(draft: NoteDraft) {
      if (mutationLoading) {
        return pendingDomainResult<NoteRef>()
      }

      if (mutationError) {
        return err(mutationError)
      }

      const note =
        draft.kind === 'basic'
          ? createBasicNoteDetail({
              ...draft,
              id: draft.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'note',
              updatedAt: new Date().toISOString(),
            })
          : ({
              cards: [],
              deckId: draft.deckId,
              dueAt: new Date().toISOString(),
              editor: draft.editor,
              id: draft.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'note',
              kind: 'cloze',
              progress: 0,
              reviewedAt: new Date().toISOString(),
              status: 'in-progress',
              title: draft.title,
              updatedAt: new Date().toISOString(),
            } satisfies NoteDetail)

      noteRecords = [note, ...noteRecords]

      return ok(toNoteRef(note))
    },
    async delete(noteId: string) {
      if (mutationLoading) {
        return pendingDomainResult<void>()
      }

      if (mutationError) {
        return err(mutationError)
      }

      noteRecords = noteRecords.filter((note) => note.id !== noteId)

      return ok(undefined)
    },
    async getById(_deckId: string, noteId: string) {
      if (loading) {
        return pendingDomainResult<NoteDetail>()
      }

      if (error) {
        return err(error)
      }

      return ok(
        noteRecords.find((note) => note.id === noteId) ??
          noteRecords.find((note) => note.id === baseBasicNoteDetail.id) ??
          baseBasicNoteDetail,
      )
    },
    async listByDeck(deckId: string, sort?: SortPreference) {
      if (loading) {
        return pendingDomainResult<NoteListItem[]>()
      }

      if (error) {
        return err(error)
      }

      if (listRefreshError && listCallCount > 0) {
        return err(listRefreshError)
      }

      listCallCount += 1

      return ok(
        sortByPreference(
          noteRecords.filter((note) => note.deckId === deckId),
          sort,
        ).map(toNoteListItem),
      )
    },
    async update(noteId: string, draft: NoteDraft) {
      if (mutationLoading) {
        return pendingDomainResult<NoteRef>()
      }

      if (mutationError) {
        return err(mutationError)
      }

      const existingNote = noteRecords.find((note) => note.id === noteId)
      const updatedNote =
        draft.kind === 'basic'
          ? createBasicNoteDetail({
              ...draft,
              id: noteId,
              updatedAt: new Date().toISOString(),
            })
          : ({
              ...(existingNote?.kind === 'cloze' ? existingNote : {}),
              cards: existingNote?.kind === 'cloze' ? existingNote.cards : [],
              deckId: draft.deckId,
              dueAt: existingNote?.dueAt ?? new Date().toISOString(),
              editor: draft.editor,
              id: noteId,
              kind: 'cloze',
              progress: existingNote?.progress ?? 0,
              reviewedAt: existingNote?.reviewedAt ?? new Date().toISOString(),
              status: existingNote?.status ?? 'in-progress',
              title: draft.title,
              updatedAt: new Date().toISOString(),
            } satisfies NoteDetail)

      noteRecords = noteRecords.map((note) => (note.id === noteId ? updatedNote : note))

      return ok(toNoteRef(updatedNote))
    },
  }
}

export const createReviewService = ({
  deckId = 'world-history',
  error,
  firstReviewable = createBasicReviewCard(),
  gradeLoading = false,
  loading = false,
  mode = 'due',
  mutationError,
  nextReviewable,
  summary = {
    completedAt: '2026-05-16T12:12:00.000Z',
    currentCard: undefined,
    deckId: 'world-history',
    durationSeconds: 720,
    id: 'world-history-review',
    mode: 'due',
    plannedCount: 42,
    reviewedCount: 24,
    startedAt: '2026-05-16T12:00:00.000Z',
    status: 'completed',
  },
  totalCount,
}: {
  deckId?: string
  error?: DomainError
  firstReviewable?: ReviewCard | null
  gradeLoading?: boolean
  loading?: boolean
  mode?: 'due' | 'practice'
  mutationError?: DomainError
  nextReviewable?: ReviewCard
  summary?: DueReviewSession
  totalCount?: number
} = {}): ReviewService => {
  let currentFirstReviewable = firstReviewable === null ? undefined : firstReviewable
  let currentReviewedCount = 0
  const plannedCount =
    totalCount ??
    (firstReviewable === null ? 0 : firstReviewable ? (nextReviewable ? 2 : 1) : 0)

  const activeSession = (): ReviewSession | undefined => {
    if (!currentFirstReviewable) {
      return undefined
    }

    if (mode === 'practice') {
      return {
        currentCard: currentFirstReviewable,
        deckId,
        durationSeconds: 0,
        id: 'world-history-practice-review',
        mode: 'practice',
        reviewedCount: currentReviewedCount,
        startedAt: '2026-05-16T12:00:00.000Z',
      } satisfies PracticeReviewSession
    }

    return {
      currentCard: currentFirstReviewable,
      deckId,
      durationSeconds: 0,
      id: 'world-history-review',
      mode: 'due',
      plannedCount,
      reviewedCount: currentReviewedCount,
      startedAt: '2026-05-16T12:00:00.000Z',
      status: 'active',
    } satisfies DueReviewSession
  }

  return {
    async start() {
      if (loading) {
        return pendingDomainResult<ReviewSession>()
      }

      if (error) {
        return err(error)
      }

      const session = activeSession()

      return ok(session ?? { mode: 'unavailable', reason: 'empty-deck' })
    },
    async get(reviewId) {
      if (loading) {
        return pendingDomainResult<ReviewSession>()
      }

      if (error) {
        return err(error)
      }

      return ok(activeSession()?.id === reviewId ? activeSession() as ReviewSession : summary)
    },
    async grade() {
      if (gradeLoading) {
        return pendingDomainResult<ReviewSession>()
      }

      if (mutationError) {
        return err(mutationError)
      }

      currentReviewedCount += 1

      if (mode === 'practice') {
        currentFirstReviewable = nextReviewable ?? currentFirstReviewable

        return ok(activeSession() as ReviewSession)
      }

      if (nextReviewable) {
        currentFirstReviewable = nextReviewable

        return ok(activeSession() as ReviewSession)
      }

      currentFirstReviewable = undefined

      return ok({
        ...summary,
        plannedCount,
        reviewedCount: currentReviewedCount,
        status: 'completed',
      })
    },
  }
}
