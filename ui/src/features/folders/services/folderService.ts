import type { DomainResult } from '@shared/errors'

import type { Folder, FolderDraft, FolderSortPreference } from '../types/folder.types'

export interface FolderService {
  create(draft: FolderDraft): DomainResult<Folder>
  delete(folderId: string): DomainResult<void>
  getById(folderId: string): DomainResult<Folder>
  getPath(folderId: string): DomainResult<string[]>
  listFolderChildren(folderId: string, sort?: FolderSortPreference): DomainResult<Folder[]>
  listWorkspaceRoot(workspaceId: string, sort?: FolderSortPreference): DomainResult<Folder[]>
  update(folderId: string, draft: FolderDraft): DomainResult<Folder>
}
