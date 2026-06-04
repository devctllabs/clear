import type { DomainResult } from '@shared/errors'
import type { SortPreference } from '@shared/types/sort.types'

import type { Folder, FolderDraft } from '../types/folder.types'

export interface FolderService {
  create(draft: FolderDraft): DomainResult<Folder>
  delete(folderId: string): DomainResult<void>
  getById(folderId: string): DomainResult<Folder>
  getPath(folderId: string): DomainResult<string[]>
  listFolderChildren(folderId: string, sort?: SortPreference): DomainResult<Folder[]>
  listWorkspaceRoot(workspaceId: string, sort?: SortPreference): DomainResult<Folder[]>
  update(folderId: string, draft: FolderDraft): DomainResult<Folder>
}
