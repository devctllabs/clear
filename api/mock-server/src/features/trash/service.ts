import type {
  TrashItem,
  TrashStateRecord,
} from '../../generated/mock-admin/contract/index.ts'
import { conflict, notFound } from '../../generated/clear-web-api/mock-runtime.ts'
import type { MockStateStore } from '../../lib/stateStore.ts'
import type { DeckRepository } from '../decks/repository.ts'
import { summarizeDeckNotes } from '../decks/stats.ts'
import type { FolderRepository } from '../folders/repository.ts'
import type { LocationPathResolver } from '../location-path/resolver.ts'
import type { NotesRepository } from '../notes/repository.ts'
import type { WorkspaceRepository } from '../workspaces/repository.ts'
import { TrashRepository } from './repository.ts'

export class TrashService {
  private readonly trash: TrashRepository
  private readonly workspaces: WorkspaceRepository
  private readonly folders: FolderRepository
  private readonly decks: DeckRepository
  private readonly notes: NotesRepository
  private readonly paths: LocationPathResolver
  private readonly stateStore: MockStateStore

  constructor(
    trash: TrashRepository,
    workspaces: WorkspaceRepository,
    folders: FolderRepository,
    decks: DeckRepository,
    notes: NotesRepository,
    paths: LocationPathResolver,
    stateStore: MockStateStore,
  ) {
    this.trash = trash
    this.workspaces = workspaces
    this.folders = folders
    this.decks = decks
    this.notes = notes
    this.paths = paths
    this.stateStore = stateStore
  }

  getTrash(): TrashStateRecord {
    return this.trash.get()
  }

  async emptyTrash() {
    return this.stateStore.transaction(async () => {
      for (const item of this.trash.get().items) {
        await this.removeUnderlyingRecord(item)
      }

      return this.trash.empty(this.stateStore.now())
    })
  }

  async restoreTrashItem(itemId: string) {
    const item = this.trash.requireItem(itemId)

    return this.stateStore.transaction(async () => {
      const now = this.stateStore.now()
      switch (item.kind) {
        case 'workspace':
          await this.restoreWorkspace(item, now)
          break
        case 'folder':
          await this.restoreFolder(item, now)
          break
        case 'deck':
          await this.restoreDeck(item, now)
          break
        case 'note':
          await this.restoreNote(item, now)
          break
      }

      await this.trash.removeItem(itemId)

      return undefined
    })
  }

  async deleteTrashItem(itemId: string) {
    const item = this.trash.requireItem(itemId)

    return this.stateStore.transaction(async () => {
      await this.removeUnderlyingRecord(item)
      await this.trash.removeItem(itemId)
      return undefined
    })
  }

  private async removeUnderlyingRecord(item: TrashItem) {
    switch (item.kind) {
      case 'workspace':
        await this.workspaces.remove(item.id)
        return
      case 'folder':
        await this.folders.remove(item.id)
        return
      case 'deck':
        await this.decks.remove(item.id)
        return
      case 'note':
        await this.notes.remove(item.id)
        return
    }
  }

  private async restoreWorkspace(item: TrashItem, updatedAt: string) {
    const workspace = this.workspaces.find(item.id)

    if (!workspace) {
      throw notFound('workspace', item.id)
    }

    if (this.workspaces.visible().some((candidate) => candidate.id !== item.id && candidate.title === workspace.title)) {
      throw conflict(`Workspace titled ${workspace.title} already exists`)
    }

    await this.workspaces.restore(item.id)
    await this.workspaces.touch(item.id, updatedAt)
  }

  private async restoreFolder(item: TrashItem, updatedAt: string) {
    const folder = this.folders.find(item.id)

    if (!folder) {
      throw notFound('folder', item.id)
    }

    if (folder.parentId === folder.workspaceId) {
      const workspace = this.workspaces.find(folder.workspaceId)
      if (!workspace || workspace.deletedAt) {
        throw conflict(`Folder ${folder.name} can no longer be restored`)
      }
    } else {
      const parentFolder = this.folders.find(folder.parentId)
      if (!parentFolder || parentFolder.deletedAt) {
        throw conflict(`Folder ${folder.name} can no longer be restored`)
      }
    }

    if (
      this.folders.visible().some(
        (candidate) =>
          candidate.id !== item.id &&
          candidate.parentId === folder.parentId &&
          candidate.name === folder.name,
      )
    ) {
      throw conflict(`Folder named ${folder.name} already exists in this location`)
    }

    await this.folders.restore(item.id)
    await this.folders.touch(item.id, updatedAt)
    await this.touchFolderAncestors(folder.parentId, updatedAt)
    await this.workspaces.touch(folder.workspaceId, updatedAt)
  }

  private async restoreDeck(item: TrashItem, updatedAt: string) {
    const deck = this.decks.find(item.id)

    if (!deck) {
      throw notFound('deck', item.id)
    }

    if (deck.parentId === deck.workspaceId) {
      const workspace = this.workspaces.find(deck.workspaceId)
      if (!workspace || workspace.deletedAt) {
        throw conflict(`Deck ${deck.title} can no longer be restored`)
      }
    } else {
      const parentFolder = this.folders.find(deck.parentId)
      if (!parentFolder || parentFolder.deletedAt) {
        throw conflict(`Deck ${deck.title} can no longer be restored`)
      }
    }

    if (
      this.decks.visible().some(
        (candidate) =>
          candidate.id !== item.id &&
          candidate.parentId === deck.parentId &&
          candidate.title === deck.title,
      )
    ) {
      throw conflict(`Deck titled ${deck.title} already exists in this location`)
    }

    await this.decks.restore(item.id)
    await this.decks.touch(item.id, updatedAt)
    await this.touchFolderAncestors(deck.parentId, updatedAt)
    await this.workspaces.touch(deck.workspaceId, updatedAt)
    await this.recomputeDeckStats(deck.id ?? '', deck.workspaceId, updatedAt)
  }

  private async restoreNote(item: TrashItem, updatedAt: string) {
    const note = this.notes.find(item.id)

    if (!note) {
      throw notFound('note', item.id)
    }

    const deck = this.decks.find(note.deckId)
    if (!deck || deck.deletedAt) {
      throw conflict(`Note ${note.title} can no longer be restored`)
    }
    await this.notes.restore(item.id)
    await this.notes.touch(item.id, updatedAt)
    await this.recomputeDeckStats(deck.id ?? '', deck.workspaceId, updatedAt)
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

  private async recomputeDeckStats(deckId: string, workspaceId: string, updatedAt: string) {
    const notes = this.notes.listByDeck(deckId)
    const nextStats = summarizeDeckNotes(notes, updatedAt)

    await this.decks.update(deckId, (deck) => ({
      ...deck,
      ...nextStats,
      updatedAt,
    }))

    await this.workspaces.touch(workspaceId, updatedAt)
  }
}
