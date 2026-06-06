import type { FolderService } from '@features/folders/services/folderService'
import type { Folder, FolderDraft } from '@features/folders/types/folder.types'
import { mockApi } from '@platform/mock/mockApi'
import { toMockDomainResult, toMockVoidDomainResult } from '@platform/mock/mockDomainResult'
import { toSortQuery } from '@shared/services/api/adapters/sortQuery'

export const mockFolderService: FolderService = {
  async create(draft) {
    return toMockDomainResult(
      () => mockApi.foldersService.createFolder(toFolderDraft(draft)),
      toFolder,
    )
  },
  async delete(folderId) {
    return toMockVoidDomainResult(() => mockApi.foldersService.deleteFolder(folderId))
  },
  async getById(folderId) {
    return toMockDomainResult(
      () => mockApi.foldersService.getFolder(folderId),
      toFolder,
    )
  },
  async getPath(folderId) {
    return toMockDomainResult(
      () => mockApi.foldersService.getFolderPath(folderId),
      ({ segments }) => segments,
    )
  },
  async listFolderChildren(folderId, sort) {
    return toMockDomainResult(
      () => mockApi.foldersService.listFolderFolders(folderId, toSortQuery(sort)),
      (folders) => folders.map(toFolder),
    )
  },
  async listWorkspaceRoot(workspaceId, sort) {
    return toMockDomainResult(
      () => mockApi.foldersService.listWorkspaceFolders(workspaceId, toSortQuery(sort)),
      (folders) => folders.map(toFolder),
    )
  },
  async update(folderId, draft) {
    return toMockDomainResult(
      () => mockApi.foldersService.updateFolder(folderId, toFolderDraft(draft)),
      toFolder,
    )
  },
}

const toFolder = (folder: unknown): Folder => folder as Folder

const toFolderDraft = (draft: FolderDraft) => draft
