import type { DeckRecord, FolderRecord, NoteDetailRecord } from '../../generated/mock-admin/contract/index.ts'
import { DeckRepository } from '../decks/repository.ts'
import { FolderRepository } from '../folders/repository.ts'
import { WorkspaceRepository } from '../workspaces/repository.ts'

export class LocationPathResolver {
  constructor(
    private readonly workspaces: WorkspaceRepository,
    private readonly folders: FolderRepository,
    private readonly decks: DeckRepository,
  ) {}

  workspacePath(workspaceId: string) {
    const workspace = this.workspaces.require(workspaceId)
    return [workspace.title]
  }

  folderLineage(folderId: string): FolderRecord[] {
    const folder = this.folders.require(folderId)

    if (folder.parentId === folder.workspaceId) {
      return [folder]
    }

    return [...this.folderLineage(folder.parentId), folder]
  }

  folderDisplayPath(folderId: string) {
    return this.folderLineage(folderId).map((folder) => folder.name)
  }

  folderLocationPath(folderId: string) {
    const folder = this.folders.require(folderId)
    const workspacePath = this.workspacePath(folder.workspaceId)

    if (folder.parentId === folder.workspaceId) {
      return workspacePath
    }

    return [...workspacePath, ...this.folderDisplayPath(folder.parentId)]
  }

  deckLocationPath(deckId: string) {
    const deck = this.decks.require(deckId)
    const workspacePath = this.workspacePath(deck.workspaceId)

    if (deck.parentId === deck.workspaceId) {
      return workspacePath
    }

    return [...workspacePath, ...this.folderDisplayPath(deck.parentId)]
  }

  noteLocationPath(note: NoteDetailRecord) {
    const deck = this.decks.require(note.deckId)
    return [...this.deckLocationPath(deck.id ?? ''), deck.title]
  }

  deckParentFolderIds(deck: DeckRecord) {
    if (deck.parentId === deck.workspaceId) {
      return []
    }

    return this.folderLineage(deck.parentId).map((folder) => folder.id ?? '')
  }

  folderParentFolderIds(folderId: string) {
    const folder = this.folders.require(folderId)

    if (folder.parentId === folder.workspaceId) {
      return []
    }

    return this.folderLineage(folder.parentId).map((ancestor) => ancestor.id ?? '')
  }

  noteDeck(deckId: string) {
    return this.decks.require(deckId)
  }
}
