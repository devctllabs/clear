import type {
  TrashItem,
  TrashStateRecord,
} from '../../generated/mock-admin/contract/index.ts'
import { conflict, notFound } from '../../generated/clear-web-api/mock-runtime.ts'
import type { MockStateRepository } from '../../generated/mock-admin/state/repository.ts'
import type { DeckRepository } from '../decks/repository.ts'
import { summarizeDeckNotes } from '../decks/stats.ts'
import type { FolderRepository } from '../folders/repository.ts'
import type { LocationPathResolver } from '../location-path/resolver.ts'
import type { NotesRepository } from '../notes/repository.ts'
import type { WorkspaceRepository } from '../workspaces/repository.ts'
import { TrashRepository } from './repository.ts'

export class TrashService {
  constructor(
    private readonly trash: TrashRepository,
    private readonly workspaces: WorkspaceRepository,
    private readonly folders: FolderRepository,
    private readonly decks: DeckRepository,
    private readonly notes: NotesRepository,
    private readonly paths: LocationPathResolver,
    private readonly stateStore: MockStateRepository,
  ) {}

  getTrash(): TrashStateRecord {
    return this.trash.get()
  }

  emptyTrash() {
    return this.stateStore.transaction(() => {
      for (const item of this.trash.get().items) {
        this.removeUnderlyingRecord(item)
      }

      return this.trash.empty(this.stateStore.now())
    })
  }

  restoreTrashItem(itemId: string) {
    const item = this.trash.requireItem(itemId)

    return this.stateStore.transaction(() => {
      const now = this.stateStore.now()
      switch (item.kind) {
        case 'workspace':
          this.restoreWorkspace(item, now)
          break
        case 'folder':
          this.restoreFolder(item, now)
          break
        case 'deck':
          this.restoreDeck(item, now)
          break
        case 'note':
          this.restoreNote(item, now)
          break
      }

      this.trash.removeItem(itemId)

      return undefined
    })
  }

  deleteTrashItem(itemId: string) {
    const item = this.trash.requireItem(itemId)

    return this.stateStore.transaction(() => {
      this.removeUnderlyingRecord(item)
      this.trash.removeItem(itemId)
      return undefined
    })
  }

  private removeUnderlyingRecord(item: TrashItem) {
    switch (item.kind) {
      case 'workspace':
        this.workspaces.remove(item.id)
        return
      case 'folder':
        this.folders.remove(item.id)
        return
      case 'deck':
        this.decks.remove(item.id)
        return
      case 'note':
        this.notes.remove(item.id)
        return
    }
  }

  private restoreWorkspace(item: TrashItem, updatedAt: string) {
    const workspace = this.workspaces.find(item.id)

    if (!workspace) {
      throw notFound('workspace', item.id)
    }

    if (this.workspaces.visible().some((candidate) => candidate.id !== item.id && candidate.title === workspace.title)) {
      throw conflict(`Workspace titled ${workspace.title} already exists`)
    }

    this.workspaces.restore(item.id)
    this.workspaces.touch(item.id, updatedAt)
  }

  private restoreFolder(item: TrashItem, updatedAt: string) {
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

    this.folders.restore(item.id)
    this.folders.touch(item.id, updatedAt)
    this.touchFolderAncestors(folder.parentId, updatedAt)
    this.workspaces.touch(folder.workspaceId, updatedAt)
  }

  private restoreDeck(item: TrashItem, updatedAt: string) {
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

    this.decks.restore(item.id)
    this.decks.touch(item.id, updatedAt)
    this.touchFolderAncestors(deck.parentId, updatedAt)
    this.workspaces.touch(deck.workspaceId, updatedAt)
    this.recomputeDeckStats(deck.id ?? '', deck.workspaceId, updatedAt)
  }

  private restoreNote(item: TrashItem, updatedAt: string) {
    const note = this.notes.find(item.id)

    if (!note) {
      throw notFound('note', item.id)
    }

    const deck = this.decks.find(note.deckId)
    if (!deck || deck.deletedAt) {
      throw conflict(`Note ${note.title} can no longer be restored`)
    }
    this.notes.restore(item.id)
    this.notes.touch(item.id, updatedAt)
    this.recomputeDeckStats(deck.id ?? '', deck.workspaceId, updatedAt)
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

  private recomputeDeckStats(deckId: string, workspaceId: string, updatedAt: string) {
    const notes = this.notes.listByDeck(deckId)
    const nextStats = summarizeDeckNotes(notes, updatedAt)

    this.decks.update(deckId, (deck) => ({
      ...deck,
      ...nextStats,
      updatedAt,
    }))

    this.workspaces.touch(workspaceId, updatedAt)
  }
}
