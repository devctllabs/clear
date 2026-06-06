import type { DeckDraft } from '../../generated/clear-web-api/contract/types.gen.ts'
import type { DeckRecord } from '../../generated/mock-admin/contract/index.ts'
import { conflict } from '../../generated/clear-web-api/mock-runtime.ts'
import type { MockStateStore } from '../../lib/stateStore.ts'
import { newIdAllocator } from '../../lib/ids.ts'
import type { FolderRepository } from '../folders/repository.ts'
import type { LocationPathResolver } from '../location-path/resolver.ts'
import type { NotesRepository } from '../notes/repository.ts'
import type { TrashRepository } from '../trash/repository.ts'
import type { WorkspaceRepository } from '../workspaces/repository.ts'
import { DeckRepository } from './repository.ts'

export class DeckService {
  private readonly decks: DeckRepository
  private readonly workspaces: WorkspaceRepository
  private readonly folders: FolderRepository
  private readonly notes: NotesRepository
  private readonly trash: TrashRepository
  private readonly paths: LocationPathResolver
  private readonly stateStore: MockStateStore

  constructor(
    decks: DeckRepository,
    workspaces: WorkspaceRepository,
    folders: FolderRepository,
    notes: NotesRepository,
    trash: TrashRepository,
    paths: LocationPathResolver,
    stateStore: MockStateStore,
  ) {
    this.decks = decks
    this.workspaces = workspaces
    this.folders = folders
    this.notes = notes
    this.trash = trash
    this.paths = paths
    this.stateStore = stateStore
  }

  listWorkspaceDecks(workspaceId: string, query?: { sortField?: string; sortDirection?: string }) {
    this.workspaces.require(workspaceId)
    return this.decks.listByWorkspace(workspaceId, this.parseSortQuery(query))
  }

  listFolderDecks(folderId: string, query?: { sortField?: string; sortDirection?: string }) {
    this.folders.require(folderId)
    return this.decks.listByParent(folderId, this.parseSortQuery(query))
  }

  async createDeck(draft: DeckDraft): Promise<DeckRecord> {
    const parent = this.resolveParent(draft.parentId)
    const duplicate = this.decks.visible().some(
      (deck) => deck.parentId === draft.parentId && deck.title === draft.title,
    )

    if (duplicate) {
      throw conflict(`Deck titled ${draft.title} already exists in this location`)
    }

    return this.stateStore.transaction(async () => {
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

      const created = await this.decks.create(deck)
      await this.touchFolderAncestors(draft.parentId, now)
      await this.workspaces.touch(parent.workspaceId, now)

      return created
    })
  }

  getDeck(deckId: string) {
    return this.decks.require(deckId)
  }

  async updateDeck(deckId: string, draft: DeckDraft) {
    const current = this.decks.require(deckId)
    const nextParent = this.resolveParent(draft.parentId)
    const duplicate = this.decks.visible().some(
      (deck) => deck.id !== deckId && deck.parentId === draft.parentId && deck.title === draft.title,
    )

    if (duplicate) {
      throw conflict(`Deck titled ${draft.title} already exists in this location`)
    }

    return this.stateStore.transaction(async () => {
      const now = this.stateStore.now()
      const updated = await this.decks.update(deckId, (deck) => ({
        ...deck,
        description: draft.description,
        icon: draft.icon,
        parentId: draft.parentId,
        title: draft.title,
        updatedAt: now,
        workspaceId: nextParent.workspaceId,
      }))

      await this.touchFolderAncestors(current.parentId, now)
      await this.touchFolderAncestors(draft.parentId, now)
      await this.workspaces.touch(current.workspaceId, now)
      if (nextParent.workspaceId !== current.workspaceId) {
        await this.workspaces.touch(nextParent.workspaceId, now)
      }

      return updated
    })
  }

  async deleteDeck(deckId: string) {
    const deck = this.decks.require(deckId)

    return this.stateStore.transaction(async () => {
      const deletedAt = this.stateStore.now()
      const deckPath = this.paths.deckLocationPath(deckId)

      for (const note of this.notes.listByDeck(deckId)) {
        const notePath = this.paths.noteLocationPath(note)
        await this.notes.markDeleted(note.id ?? '', deletedAt)
        await this.trash.addItem({
          deletedAt,
          id: note.id ?? '',
          kind: 'note',
          locationPath: notePath,
          title: note.title,
        })
      }

      await this.decks.markDeleted(deckId, deletedAt)
      await this.trash.addItem({
        deletedAt,
        id: deck.id ?? '',
        kind: 'deck',
        locationPath: deckPath,
        title: deck.title,
      })
      await this.touchFolderAncestors(deck.parentId, deletedAt)
      await this.workspaces.touch(deck.workspaceId, deletedAt)
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

  private async touchFolderAncestors(parentId: string, updatedAt: string) {
    if (this.workspaces.find(parentId)) {
      return
    }

    for (const ancestorId of this.paths.folderParentFolderIds(parentId)) {
      await this.folders.touch(ancestorId, updatedAt)
    }

    await this.folders.touch(parentId, updatedAt)
  }
}
