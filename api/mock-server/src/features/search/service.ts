import type {
  DeckSearchResult,
  DeckSearchResultGroup,
  FolderSearchResult,
  FolderSearchResultGroup,
  NoteSearchResult,
  NoteSearchResultGroup,
  SearchRequest,
  SearchSearchResultGroup,
} from '../../generated/clear-web-api/contract/types.gen.ts'
import type { DeckRecord, FolderRecord, NoteDetailRecord } from '../../generated/mock-admin/contract/index.ts'
import type { DeckRepository } from '../decks/repository.ts'
import type { FolderRepository } from '../folders/repository.ts'
import type { LocationPathResolver } from '../location-path/resolver.ts'
import type { NotesRepository } from '../notes/repository.ts'
import type { WorkspaceRepository } from '../workspaces/repository.ts'

type SearchContext = SearchRequest['scope']

const includesQuery = (value: string, query: string) =>
  value.toLowerCase().includes(query.toLowerCase())

const sortByUpdatedDesc = <T extends { updatedAt: string }>(items: T[]) =>
  [...items].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))

export class SearchService {
  constructor(
    private readonly workspaces: WorkspaceRepository,
    private readonly folders: FolderRepository,
    private readonly decks: DeckRepository,
    private readonly notes: NotesRepository,
    private readonly paths: LocationPathResolver,
  ) {}

  searchContent(request: SearchRequest): SearchSearchResultGroup[] {
    const query = request.query.trim()
    const scope = request.scope

    if (scope.kind === 'workspace') {
      return this.searchWorkspace(scope.workspaceId, query)
    }

    if (scope.kind === 'folder') {
      return this.searchFolder(scope.folderId, query)
    }

    return this.searchDeck(scope.deckId, query)
  }

  private searchWorkspace(workspaceId: string, query: string) {
    this.workspaces.require(workspaceId)

    const folderResults = sortByUpdatedDesc(
      this.folders.visible().filter((folder) => folder.workspaceId === workspaceId && this.matchesFolder(folder, query)),
    ).map((folder) => this.toFolderSearchResult(folder))

    const deckResults = sortByUpdatedDesc(
      this.decks.visible().filter((deck) => deck.workspaceId === workspaceId && this.matchesDeck(deck, query)),
    ).map((deck) => this.toDeckSearchResult(deck))

    const noteResults = sortByUpdatedDesc(
      this.notes.visible().filter((note) => {
        const deck = this.decks.find(note.deckId)
        return deck?.workspaceId === workspaceId && this.matchesNote(note, query)
      }),
    ).map((note) => this.toNoteSearchResult(note))

    return this.groupResults(folderResults, deckResults, noteResults)
  }

  private searchFolder(folderId: string, query: string) {
    const scopeFolder = this.folders.require(folderId)

    const folderResults = sortByUpdatedDesc(
      this.folders.visible().filter((folder) => this.folderInScope(folder, scopeFolder) && this.matchesFolder(folder, query)),
    ).map((folder) => this.toFolderSearchResult(folder))

    const deckResults = sortByUpdatedDesc(
      this.decks.visible().filter((deck) => this.deckInFolderScope(deck, scopeFolder) && this.matchesDeck(deck, query)),
    ).map((deck) => this.toDeckSearchResult(deck))

    const noteResults = sortByUpdatedDesc(
      this.notes.visible().filter((note) => {
        const deck = this.decks.find(note.deckId)
        return deck ? this.deckInFolderScope(deck, scopeFolder) && this.matchesNote(note, query) : false
      }),
    ).map((note) => this.toNoteSearchResult(note))

    return this.groupResults(folderResults, deckResults, noteResults)
  }

  private searchDeck(deckId: string, query: string) {
    const deck = this.decks.require(deckId)
    const noteResults = sortByUpdatedDesc(
      this.notes.visible().filter((note) => note.deckId === deckId && this.matchesNote(note, query)),
    ).map((note) => this.toNoteSearchResult(note))

    return this.groupResults([], [], noteResults)
  }

  private matchesFolder(folder: FolderRecord, query: string) {
    return includesQuery(folder.name, query) || includesQuery(folder.description, query)
  }

  private matchesDeck(deck: DeckRecord, query: string) {
    return includesQuery(deck.title, query) || includesQuery(deck.description, query)
  }

  private matchesNote(note: NoteDetailRecord, query: string) {
    if (note.kind === 'basic') {
      return (
        includesQuery(note.title, query) ||
        includesQuery(note.editor.front, query) ||
        includesQuery(note.editor.back, query)
      )
    }

    return includesQuery(note.title, query) || includesQuery(note.editor.body, query)
  }

  private folderInScope(folder: FolderRecord, scopeFolder: FolderRecord) {
    if (folder.id === scopeFolder.id) {
      return true
    }

    try {
      return this.paths.folderLineage(folder.id ?? '').some((ancestor) => ancestor.id === scopeFolder.id)
    } catch {
      return false
    }
  }

  private deckInFolderScope(deck: DeckRecord, scopeFolder: FolderRecord) {
    if (deck.parentId === deck.workspaceId) {
      return false
    }

    try {
      return this.paths.folderLineage(deck.parentId).some((ancestor) => ancestor.id === scopeFolder.id)
    } catch {
      return false
    }
  }

  private toFolderSearchResult(folder: FolderRecord): FolderSearchResult {
    return {
      id: folder.id ?? '',
      kind: 'folder',
      locationPath: this.paths.folderLocationPath(folder.id ?? ''),
      title: folder.name,
      updatedAt: folder.updatedAt,
      workspaceId: folder.workspaceId,
    }
  }

  private toDeckSearchResult(deck: DeckRecord): DeckSearchResult {
    return {
      deckIcon: deck.icon,
      id: deck.id ?? '',
      kind: 'deck',
      locationPath: this.paths.deckLocationPath(deck.id ?? ''),
      title: deck.title,
      updatedAt: deck.updatedAt,
      workspaceId: deck.workspaceId,
    }
  }

  private toNoteSearchResult(note: NoteDetailRecord): NoteSearchResult {
    const deck = this.decks.require(note.deckId)

    return {
      deckId: note.deckId,
      id: note.id ?? '',
      kind: 'note',
      locationPath: this.paths.noteLocationPath(note),
      noteKind: note.kind,
      title: note.title,
      updatedAt: note.updatedAt,
      workspaceId: deck.workspaceId,
    }
  }

  private groupResults(
    folderResults: FolderSearchResult[],
    deckResults: DeckSearchResult[],
    noteResults: NoteSearchResult[],
  ) {
    const groups: SearchSearchResultGroup[] = []

    if (folderResults.length > 0) {
      groups.push({ kind: 'folder', results: folderResults } satisfies FolderSearchResultGroup)
    }

    if (deckResults.length > 0) {
      groups.push({ kind: 'deck', results: deckResults } satisfies DeckSearchResultGroup)
    }

    if (noteResults.length > 0) {
      groups.push({ kind: 'note', results: noteResults } satisfies NoteSearchResultGroup)
    }

    return groups
  }
}
