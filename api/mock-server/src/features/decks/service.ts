import type { DeckDraft } from '../../generated/clear-web-api/contract/types.gen.ts'
import type { DeckRecord } from '../../generated/mock-admin/contract/index.ts'
import { conflict } from '../../generated/clear-web-api/mock-runtime.ts'
import type { MockStateRepository } from '../../generated/mock-admin/state/repository.ts'
import { newIdAllocator } from '../../lib/ids.ts'
import type { FolderRepository } from '../folders/repository.ts'
import type { LocationPathResolver } from '../location-path/resolver.ts'
import type { NotesRepository } from '../notes/repository.ts'
import type { TrashRepository } from '../trash/repository.ts'
import type { WorkspaceRepository } from '../workspaces/repository.ts'
import { DeckRepository } from './repository.ts'

export class DeckService {
  constructor(
    private readonly decks: DeckRepository,
    private readonly workspaces: WorkspaceRepository,
    private readonly folders: FolderRepository,
    private readonly notes: NotesRepository,
    private readonly trash: TrashRepository,
    private readonly paths: LocationPathResolver,
    private readonly stateStore: MockStateRepository,
  ) {}

  listWorkspaceDecks(workspaceId: string, query?: { sortField?: string; sortDirection?: string }) {
    this.workspaces.require(workspaceId)
    return this.decks.listByWorkspace(workspaceId, this.parseSortQuery(query))
  }

  listFolderDecks(folderId: string, query?: { sortField?: string; sortDirection?: string }) {
    this.folders.require(folderId)
    return this.decks.listByParent(folderId, this.parseSortQuery(query))
  }

  createDeck(draft: DeckDraft): DeckRecord {
    const parent = this.resolveParent(draft.parentId)
    const duplicate = this.decks.visible().some(
      (deck) => deck.parentId === draft.parentId && deck.title === draft.title,
    )

    if (duplicate) {
      throw conflict(`Deck titled ${draft.title} already exists in this location`)
    }

    return this.stateStore.transaction(() => {
      const ids = newIdAllocator(this.stateStore.getSlice('idCounters'))
      const now = this.stateStore.now()
      const deck: DeckRecord = {
        description: draft.description,
        dueToday: 0,
        icon: draft.icon,
        id: ids.next('deck'),
        parentId: draft.parentId,
        progress: 0,
        title: draft.title,
        totalNotes: 0,
        updatedAt: now,
        workspaceId: parent.workspaceId,
      }

      this.decks.create(deck)
      this.touchFolderAncestors(draft.parentId, now)
      this.workspaces.touch(parent.workspaceId, now)

      return deck
    })
  }

  getDeck(deckId: string) {
    return this.decks.require(deckId)
  }

  updateDeck(deckId: string, draft: DeckDraft) {
    const current = this.decks.require(deckId)
    const nextParent = this.resolveParent(draft.parentId)
    const duplicate = this.decks.visible().some(
      (deck) => deck.id !== deckId && deck.parentId === draft.parentId && deck.title === draft.title,
    )

    if (duplicate) {
      throw conflict(`Deck titled ${draft.title} already exists in this location`)
    }

    return this.stateStore.transaction(() => {
      const now = this.stateStore.now()
      const updated = this.decks.update(deckId, (deck) => ({
        ...deck,
        description: draft.description,
        icon: draft.icon,
        parentId: draft.parentId,
        title: draft.title,
        updatedAt: now,
        workspaceId: nextParent.workspaceId,
      }))

      this.touchFolderAncestors(current.parentId, now)
      this.touchFolderAncestors(draft.parentId, now)
      this.workspaces.touch(current.workspaceId, now)
      if (nextParent.workspaceId !== current.workspaceId) {
        this.workspaces.touch(nextParent.workspaceId, now)
      }

      return updated
    })
  }

  deleteDeck(deckId: string) {
    const deck = this.decks.require(deckId)

    return this.stateStore.transaction(() => {
      const deletedAt = this.stateStore.now()
      const deckPath = this.paths.deckLocationPath(deckId)

      for (const note of this.notes.listByDeck(deckId)) {
        const notePath = this.paths.noteLocationPath(note)
        this.notes.markDeleted(note.id ?? '', deletedAt)
        this.trash.addItem({
          deletedAt,
          id: note.id ?? '',
          kind: 'note',
          locationPath: notePath,
          title: note.title,
        })
      }

      this.decks.markDeleted(deckId, deletedAt)
      this.trash.addItem({
        deletedAt,
        id: deck.id ?? '',
        kind: 'deck',
        locationPath: deckPath,
        title: deck.title,
      })
      this.touchFolderAncestors(deck.parentId, deletedAt)
      this.workspaces.touch(deck.workspaceId, deletedAt)
    })
  }

  private resolveParent(parentId: string) {
    const workspace = this.workspaces.find(parentId)

    if (workspace && !workspace.deletedAt) {
      return {
        workspaceId: workspace.id ?? parentId,
      }
    }

    const folder = this.folders.require(parentId)
    return {
      workspaceId: folder.workspaceId,
    }
  }

  private parseSortQuery(query: { sortField?: string; sortDirection?: string } = {}) {
    return {
      sortDirection: query.sortDirection === 'desc' ? 'desc' : 'asc',
      sortField:
        query.sortField === 'dueToday' || query.sortField === 'title' || query.sortField === 'updated'
          ? query.sortField
          : undefined,
    } as const
  }

  private touchFolderAncestors(parentId: string, updatedAt: string) {
    if (this.workspaces.find(parentId)) {
      return
    }

    for (const ancestorId of this.paths.folderParentFolderIds(parentId)) {
      this.folders.touch(ancestorId, updatedAt)
    }

    this.folders.touch(parentId, updatedAt)
  }
}
