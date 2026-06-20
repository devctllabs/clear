import type { FolderDraft } from '../../generated/clear-web-api/contract/types.gen.ts'
import type { FolderRecord } from '../../generated/mock-admin/contract/index.ts'
import { conflict } from '../../generated/clear-web-api/mock-runtime.ts'
import type { MockStateStore } from '../../lib/stateStore.ts'
import { newIdAllocator } from '../../lib/ids.ts'
import { requireNonBlankText, trimOptionalText } from '../../lib/validation.ts'
import type { DeckRepository } from '../decks/repository.ts'
import type { LocationPathResolver } from '../location-path/resolver.ts'
import type { NotesRepository } from '../notes/repository.ts'
import type { TrashRepository } from '../trash/repository.ts'
import type { WorkspaceRepository } from '../workspaces/repository.ts'
import { FolderRepository } from './repository.ts'

export class FolderService {
  private readonly folders: FolderRepository
  private readonly workspaces: WorkspaceRepository
  private readonly decks: DeckRepository
  private readonly notes: NotesRepository
  private readonly trash: TrashRepository
  private readonly paths: LocationPathResolver
  private readonly stateStore: MockStateStore

  constructor(
    folders: FolderRepository,
    workspaces: WorkspaceRepository,
    decks: DeckRepository,
    notes: NotesRepository,
    trash: TrashRepository,
    paths: LocationPathResolver,
    stateStore: MockStateStore,
  ) {
    this.folders = folders
    this.workspaces = workspaces
    this.decks = decks
    this.notes = notes
    this.trash = trash
    this.paths = paths
    this.stateStore = stateStore
  }

  listWorkspaceFolders(workspaceId: string, query?: { sortField?: string; sortDirection?: string }) {
    this.workspaces.require(workspaceId)
    return this.folders.listByWorkspace(workspaceId, this.parseSortQuery(query))
  }

  listFolderFolders(folderId: string, query?: { sortField?: string; sortDirection?: string }) {
    this.folders.require(folderId)
    return this.folders.listByParent(folderId, this.parseSortQuery(query))
  }

  async createFolder(draft: FolderDraft): Promise<FolderRecord> {
    const normalizedDraft = {
      ...draft,
      description: trimOptionalText(draft.description),
      name: requireNonBlankText(draft.name, 'name'),
    }
    const parent = this.resolveParent(normalizedDraft.parentId)
    const duplicate = this.folders.visible().some(
      (folder) => folder.parentId === normalizedDraft.parentId && folder.name === normalizedDraft.name,
    )

    if (duplicate) {
      throw conflict(`Folder named ${normalizedDraft.name} already exists in this location`)
    }

    return this.stateStore.transaction(async () => {
      const ids = newIdAllocator(this.stateStore.getSlice('idCounters'))
      const now = this.stateStore.now()
      const folder: FolderRecord = {
        description: normalizedDraft.description,
        id: ids.next('folder'),
        name: normalizedDraft.name,
        parentId: normalizedDraft.parentId,
        updatedAt: now,
        workspaceId: parent.workspaceId,
      }

      const created = await this.folders.create(folder)
      await this.touchFolderAncestors(normalizedDraft.parentId, now)
      await this.workspaces.touch(parent.workspaceId, now)

      return created
    })
  }

  getFolder(folderId: string) {
    return this.folders.require(folderId)
  }

  async updateFolder(folderId: string, draft: FolderDraft) {
    const normalizedDraft = {
      ...draft,
      description: trimOptionalText(draft.description),
      name: requireNonBlankText(draft.name, 'name'),
    }
    const current = this.folders.require(folderId)
    const nextParent = this.resolveParent(normalizedDraft.parentId)
    const duplicate = this.folders.visible().some(
      (folder) =>
        folder.id !== folderId &&
        folder.parentId === normalizedDraft.parentId &&
        folder.name === normalizedDraft.name,
    )

    if (duplicate) {
      throw conflict(`Folder named ${normalizedDraft.name} already exists in this location`)
    }

    return this.stateStore.transaction(async () => {
      const now = this.stateStore.now()
      const updated = await this.folders.update(folderId, (folder) => ({
        ...folder,
        description: normalizedDraft.description,
        name: normalizedDraft.name,
        parentId: normalizedDraft.parentId,
        updatedAt: now,
        workspaceId: nextParent.workspaceId,
      }))

      await this.touchFolderAncestors(current.parentId, now)
      await this.touchFolderAncestors(normalizedDraft.parentId, now)
      await this.workspaces.touch(current.workspaceId, now)
      if (nextParent.workspaceId !== current.workspaceId) {
        await this.workspaces.touch(nextParent.workspaceId, now)
      }

      return updated
    })
  }

  async deleteFolder(folderId: string) {
    const folder = this.folders.require(folderId)

    return this.stateStore.transaction(async () => {
      const deletedAt = this.stateStore.now()
      const folderPath = this.paths.folderLocationPath(folderId)

      for (const childFolder of this.folders.listByParent(folderId)) {
        await this.deleteFolderTree(childFolder.id ?? '', deletedAt)
      }

      for (const childDeck of this.decks.listByParent(folderId)) {
        await this.deleteDeckTree(childDeck.id ?? '', deletedAt)
      }

      await this.folders.markDeleted(folderId, deletedAt)
      await this.trash.addItem({
        deletedAt,
        id: folder.id ?? '',
        kind: 'folder',
        locationPath: folderPath,
        title: folder.name,
      })
      await this.touchFolderAncestors(folder.parentId, deletedAt)
      await this.workspaces.touch(folder.workspaceId, deletedAt)
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
      sortField:
        query.sortField === 'title' || query.sortField === 'updatedAt' ? query.sortField : undefined,
    } as const
  }

  private async touchFolderAncestors(folderId: string, updatedAt: string) {
    if (!this.folders.find(folderId)) {
      return
    }

    for (const ancestorId of this.paths.folderParentFolderIds(folderId)) {
      await this.folders.touch(ancestorId, updatedAt)
    }
  }

  private async deleteFolderTree(folderId: string, deletedAt: string) {
    const folder = this.folders.require(folderId)
    const folderPath = this.paths.folderLocationPath(folderId)

    for (const childFolder of this.folders.listByParent(folderId)) {
      await this.deleteFolderTree(childFolder.id ?? '', deletedAt)
    }

    for (const childDeck of this.decks.listByParent(folderId)) {
      await this.deleteDeckTree(childDeck.id ?? '', deletedAt)
    }

    await this.folders.markDeleted(folderId, deletedAt)
    await this.trash.addItem({
      deletedAt,
      id: folder.id ?? '',
      kind: 'folder',
      locationPath: folderPath,
      title: folder.name,
    })
    await this.touchFolderAncestors(folder.parentId, deletedAt)
    await this.workspaces.touch(folder.workspaceId, deletedAt)
  }

  private async deleteDeckTree(deckId: string, deletedAt: string) {
    const deck = this.decks.require(deckId)
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
  }
}
