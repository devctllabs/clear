import type {
  ActiveWorkspace,
  DeleteWorkspaceResult,
  WorkspaceDraft,
  WorkspaceListResult,
} from '../../generated/clear-web-api/contract/types.gen.ts'
import type { WorkspaceRecord } from '../../generated/mock-admin/contract/index.ts'
import { conflict, notFound } from '../../generated/clear-web-api/mock-runtime.ts'
import type { MockStateRepository } from '../../generated/mock-admin/state/repository.ts'
import { newIdAllocator } from '../../lib/ids.ts'
import type { DeckRepository } from '../decks/repository.ts'
import type { FolderRepository } from '../folders/repository.ts'
import type { LocationPathResolver } from '../location-path/resolver.ts'
import type { NotesRepository } from '../notes/repository.ts'
import type { TrashRepository } from '../trash/repository.ts'
import { WorkspaceRepository } from './repository.ts'

export class WorkspacesService {
  constructor(
    private readonly workspaces: WorkspaceRepository,
    private readonly folders: FolderRepository,
    private readonly decks: DeckRepository,
    private readonly notes: NotesRepository,
    private readonly trash: TrashRepository,
    private readonly paths: LocationPathResolver,
    private readonly stateStore: MockStateRepository,
  ) {}

  listWorkspaces(): WorkspaceListResult {
    const activeWorkspaceId = this.activeWorkspaceId()

    return {
      activeWorkspaceId,
      workspaces: this.workspaces.list(),
    }
  }

  createWorkspace(draft: WorkspaceDraft): WorkspaceRecord {
    const duplicate = this.workspaces.visible().some((workspace) => workspace.title === draft.title)

    if (duplicate) {
      throw conflict(`Workspace titled ${draft.title} already exists`)
    }

    return this.stateStore.transaction(() => {
      const ids = newIdAllocator(this.stateStore.getSlice('idCounters'))
      const now = this.stateStore.now()
      const workspace: WorkspaceRecord = {
        description: draft.description,
        icon: draft.icon,
        id: ids.next('workspace'),
        title: draft.title,
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

  setActiveWorkspace(workspaceId: string) {
    const workspace = this.workspaces.require(workspaceId)

    return this.stateStore.transaction(() => {
      this.workspaces.setActiveWorkspace(workspace.id ?? '')
    })
  }

  getWorkspace(workspaceId: string) {
    return this.workspaces.require(workspaceId)
  }

  updateWorkspace(workspaceId: string, draft: WorkspaceDraft) {
    const current = this.workspaces.require(workspaceId)
    const duplicate = this.workspaces.visible().some(
      (workspace) => workspace.id !== workspaceId && workspace.title === draft.title,
    )

    if (duplicate) {
      throw conflict(`Workspace titled ${draft.title} already exists`)
    }

    return this.stateStore.transaction(() => {
      const now = this.stateStore.now()
      return this.workspaces.update(workspaceId, (workspace) => ({
        ...workspace,
        description: draft.description,
        icon: draft.icon,
        title: draft.title,
        updatedAt: now,
      }))
    })
  }

  deleteWorkspace(workspaceId: string): DeleteWorkspaceResult {
    const workspace = this.workspaces.require(workspaceId)
    const currentActive = this.workspaces.getActiveWorkspace().workspaceId

    return this.stateStore.transaction(() => {
      const deletedAt = this.stateStore.now()
      const workspacePath = this.paths.workspacePath(workspaceId)

      for (const folder of this.folders.listByWorkspace(workspaceId)) {
        this.deleteFolderTree(folder.id ?? '', deletedAt)
      }

      for (const deck of this.decks.listByWorkspace(workspaceId)) {
        this.deleteDeckTree(deck.id ?? '', deletedAt)
      }

      this.workspaces.markDeleted(workspaceId, deletedAt)
      this.trash.addItem({
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
        this.workspaces.setActiveWorkspace(nextVisible.id ?? '')
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
    this.workspaces.touch(deck.workspaceId, deletedAt)
  }
}
