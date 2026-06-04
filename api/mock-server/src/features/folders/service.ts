import type { FolderDraft } from '../../generated/clear-web-api/contract/types.gen.ts'
import type { FolderRecord } from '../../generated/mock-admin/contract/index.ts'
import { conflict } from '../../generated/clear-web-api/mock-runtime.ts'
import type { MockStateRepository } from '../../generated/mock-admin/state/repository.ts'
import { newIdAllocator } from '../../lib/ids.ts'
import type { DeckRepository } from '../decks/repository.ts'
import type { LocationPathResolver } from '../location-path/resolver.ts'
import type { NotesRepository } from '../notes/repository.ts'
import type { TrashRepository } from '../trash/repository.ts'
import type { WorkspaceRepository } from '../workspaces/repository.ts'
import { FolderRepository } from './repository.ts'

export class FolderService {
  constructor(
    private readonly folders: FolderRepository,
    private readonly workspaces: WorkspaceRepository,
    private readonly decks: DeckRepository,
    private readonly notes: NotesRepository,
    private readonly trash: TrashRepository,
    private readonly paths: LocationPathResolver,
    private readonly stateStore: MockStateRepository,
  ) {}

  listWorkspaceFolders(workspaceId: string, query?: { sortField?: string; sortDirection?: string }) {
    this.workspaces.require(workspaceId)
    return this.folders.listByWorkspace(workspaceId, this.parseSortQuery(query))
  }

  listFolderFolders(folderId: string, query?: { sortField?: string; sortDirection?: string }) {
    this.folders.require(folderId)
    return this.folders.listByParent(folderId, this.parseSortQuery(query))
  }

  createFolder(draft: FolderDraft): FolderRecord {
    const parent = this.resolveParent(draft.parentId)
    const duplicate = this.folders.visible().some(
      (folder) => folder.parentId === draft.parentId && folder.name === draft.name,
    )

    if (duplicate) {
      throw conflict(`Folder named ${draft.name} already exists in this location`)
    }

    return this.stateStore.transaction(() => {
      const ids = newIdAllocator(this.stateStore.getSlice('idCounters'))
      const now = this.stateStore.now()
      const folder: FolderRecord = {
        description: draft.description,
        id: ids.next('folder'),
        name: draft.name,
        parentId: draft.parentId,
        updatedAt: now,
        workspaceId: parent.workspaceId,
      }

      this.folders.create(folder)
      this.touchFolderAncestors(draft.parentId, now)
      this.workspaces.touch(parent.workspaceId, now)

      return folder
    })
  }

  getFolder(folderId: string) {
    return this.folders.require(folderId)
  }

  updateFolder(folderId: string, draft: FolderDraft) {
    const current = this.folders.require(folderId)
    const nextParent = this.resolveParent(draft.parentId)
    const duplicate = this.folders.visible().some(
      (folder) =>
        folder.id !== folderId &&
        folder.parentId === draft.parentId &&
        folder.name === draft.name,
    )

    if (duplicate) {
      throw conflict(`Folder named ${draft.name} already exists in this location`)
    }

    return this.stateStore.transaction(() => {
      const now = this.stateStore.now()
      const updated = this.folders.update(folderId, (folder) => ({
        ...folder,
        description: draft.description,
        name: draft.name,
        parentId: draft.parentId,
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

  deleteFolder(folderId: string) {
    const folder = this.folders.require(folderId)

    return this.stateStore.transaction(() => {
      const deletedAt = this.stateStore.now()
      const folderPath = this.paths.folderLocationPath(folderId)

      for (const childFolder of this.folders.listByParent(folderId)) {
        this.deleteFolderTree(childFolder.id ?? '', deletedAt)
      }

      for (const childDeck of this.decks.listByParent(folderId)) {
        this.deleteDeckTree(childDeck.id ?? '', deletedAt)
      }

      this.folders.markDeleted(folderId, deletedAt)
      this.trash.addItem({
        deletedAt,
        id: folder.id ?? '',
        kind: 'folder',
        locationPath: folderPath,
        title: folder.name,
      })
      this.touchFolderAncestors(folder.parentId, deletedAt)
      this.workspaces.touch(folder.workspaceId, deletedAt)
    })
  }

  getFolderPath(folderId: string) {
    this.folders.require(folderId)
    return {
      segments: this.paths.folderDisplayPath(folderId),
    }
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
      sortField: query.sortField === 'title' || query.sortField === 'updated' ? query.sortField : undefined,
    } as const
  }

  private touchFolderAncestors(folderId: string, updatedAt: string) {
    if (!this.folders.find(folderId)) {
      return
    }

    for (const ancestorId of this.paths.folderParentFolderIds(folderId)) {
      this.folders.touch(ancestorId, updatedAt)
    }
  }

  private deleteFolderTree(folderId: string, deletedAt: string) {
    const folder = this.folders.require(folderId)
    const folderPath = this.paths.folderLocationPath(folderId)

    for (const childFolder of this.folders.listByParent(folderId)) {
      this.deleteFolderTree(childFolder.id ?? '', deletedAt)
    }

    for (const childDeck of this.decks.listByParent(folderId)) {
      this.deleteDeckTree(childDeck.id ?? '', deletedAt)
    }

    this.folders.markDeleted(folderId, deletedAt)
    this.trash.addItem({
      deletedAt,
      id: folder.id ?? '',
      kind: 'folder',
      locationPath: folderPath,
      title: folder.name,
    })
    this.touchFolderAncestors(folder.parentId, deletedAt)
    this.workspaces.touch(folder.workspaceId, deletedAt)
  }

  private deleteDeckTree(deckId: string, deletedAt: string) {
    const deck = this.decks.require(deckId)
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
  }
}
