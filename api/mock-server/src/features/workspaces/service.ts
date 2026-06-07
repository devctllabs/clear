import type {
  ActiveWorkspace,
  DeleteWorkspaceResult,
  WorkspaceDraft,
  WorkspaceListResult,
} from '../../generated/clear-web-api/contract/types.gen.ts'
import type { WorkspaceRecord } from '../../generated/mock-admin/contract/index.ts'
import { conflict } from '../../generated/clear-web-api/mock-runtime.ts'
import type { MockStateStore } from '../../lib/stateStore.ts'
import { newIdAllocator } from '../../lib/ids.ts'
import { requireNonBlankText, trimOptionalText } from '../../lib/validation.ts'
import type { DeckRepository } from '../decks/repository.ts'
import type { FolderRepository } from '../folders/repository.ts'
import type { LocationPathResolver } from '../location-path/resolver.ts'
import type { NotesRepository } from '../notes/repository.ts'
import type { TrashRepository } from '../trash/repository.ts'
import { WorkspaceRepository } from './repository.ts'

export class WorkspacesService {
  private readonly workspaces: WorkspaceRepository
  private readonly folders: FolderRepository
  private readonly decks: DeckRepository
  private readonly notes: NotesRepository
  private readonly trash: TrashRepository
  private readonly paths: LocationPathResolver
  private readonly stateStore: MockStateStore

  constructor(
    workspaces: WorkspaceRepository,
    folders: FolderRepository,
    decks: DeckRepository,
    notes: NotesRepository,
    trash: TrashRepository,
    paths: LocationPathResolver,
    stateStore: MockStateStore,
  ) {
    this.workspaces = workspaces
    this.folders = folders
    this.decks = decks
    this.notes = notes
    this.trash = trash
    this.paths = paths
    this.stateStore = stateStore
  }

  listWorkspaces(): WorkspaceListResult {
    const activeWorkspaceId = this.activeWorkspaceId()

    return {
      activeWorkspaceId,
      workspaces: this.workspaces.list(),
    }
  }

  async createWorkspace(draft: WorkspaceDraft): Promise<WorkspaceRecord> {
    const normalizedDraft = {
      ...draft,
      description: trimOptionalText(draft.description),
      title: requireNonBlankText(draft.title, 'title'),
    }
    const duplicate = this.workspaces.visible().some(
      (workspace) => workspace.title === normalizedDraft.title,
    )

    if (duplicate) {
      throw conflict(`Workspace titled ${normalizedDraft.title} already exists`)
    }

    return this.stateStore.transaction(async () => {
      const ids = newIdAllocator(this.stateStore.getSlice('idCounters'))
      const now = this.stateStore.now()
      const workspace: WorkspaceRecord = {
        description: normalizedDraft.description,
        icon: normalizedDraft.icon,
        id: ids.next('workspace'),
        title: normalizedDraft.title,
        updatedAt: now,
      }

      return this.workspaces.create(workspace)
    })
  }

  getActiveWorkspace(): ActiveWorkspace {
    const workspaceId = this.workspaces.getActiveWorkspace().workspaceId
    this.workspaces.require(workspaceId)

    return {
      workspaceId,
    }
  }

  async setActiveWorkspace(workspaceId: string) {
    const workspace = this.workspaces.require(workspaceId)

    return this.stateStore.transaction(async () => {
      await this.workspaces.setActiveWorkspace(workspace.id ?? '')
    })
  }

  getWorkspace(workspaceId: string) {
    return this.workspaces.require(workspaceId)
  }

  async updateWorkspace(workspaceId: string, draft: WorkspaceDraft) {
    this.workspaces.require(workspaceId)
    const normalizedDraft = {
      ...draft,
      description: trimOptionalText(draft.description),
      title: requireNonBlankText(draft.title, 'title'),
    }
    const duplicate = this.workspaces.visible().some(
      (workspace) => workspace.id !== workspaceId && workspace.title === normalizedDraft.title,
    )

    if (duplicate) {
      throw conflict(`Workspace titled ${normalizedDraft.title} already exists`)
    }

    return this.stateStore.transaction(async () => {
      const now = this.stateStore.now()
      return this.workspaces.update(workspaceId, (workspace) => ({
        ...workspace,
        description: normalizedDraft.description,
        icon: normalizedDraft.icon,
        title: normalizedDraft.title,
        updatedAt: now,
      }))
    })
  }

  async deleteWorkspace(workspaceId: string): Promise<DeleteWorkspaceResult> {
    const workspace = this.workspaces.require(workspaceId)
    const currentActive = this.workspaces.getActiveWorkspace().workspaceId

    return this.stateStore.transaction(async () => {
      const deletedAt = this.stateStore.now()
      const workspacePath = this.paths.workspacePath(workspaceId)

      for (const folder of this.folders.listByWorkspace(workspaceId)) {
        await this.deleteFolderTree(folder.id ?? '', deletedAt)
      }

      for (const deck of this.decks.listByWorkspace(workspaceId)) {
        await this.deleteDeckTree(deck.id ?? '', deletedAt)
      }

      await this.workspaces.markDeleted(workspaceId, deletedAt)
      await this.trash.addItem({
        deletedAt,
        id: workspace.id ?? '',
        kind: 'workspace',
        locationPath: workspacePath,
        title: workspace.title,
      })

      const nextVisible = currentActive === workspaceId
        ? this.workspaces.firstVisibleOtherThan(workspaceId)
        : null

      if (nextVisible) {
        await this.workspaces.setActiveWorkspace(nextVisible.id ?? '')
      }

      return {
        activeWorkspaceId: this.activeWorkspaceId(),
      }
    })
  }

  private activeWorkspaceId() {
    const activeWorkspaceId = this.workspaces.getActiveWorkspace().workspaceId
    const activeWorkspace = this.workspaces.find(activeWorkspaceId)

    return activeWorkspace && !activeWorkspace.deletedAt ? activeWorkspaceId : null
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
    await this.workspaces.touch(deck.workspaceId, deletedAt)
  }
}
