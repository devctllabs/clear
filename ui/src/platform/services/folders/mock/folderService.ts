import type { FolderService } from '@features/folders/services/folderService'
import { domainError, err, ok } from '@shared/errors'
import { mockAppDataStore } from '@platform/mock/mockAppDataStore'

export const mockFolderService: FolderService = {
  async create(draft) {
    return ok(mockAppDataStore.createFolder(draft))
  },
  async delete(folderId) {
    mockAppDataStore.deleteFolder(folderId)

    return ok(undefined)
  },
  async getById(folderId) {
    const folder = mockAppDataStore.getFolderById(folderId)

    return folder
      ? ok(folder)
      : err(domainError.notFound('Folder not found.', 'folder', folderId))
  },
  async getPath(folderId) {
    return ok(mockAppDataStore.getFolderPath(folderId))
  },
  async listFolderChildren(folderId, sort) {
    return ok(mockAppDataStore.listFoldersInFolder(folderId, sort))
  },
  async listWorkspaceRoot(workspaceId, sort) {
    return ok(mockAppDataStore.listWorkspaceFolders(workspaceId, sort))
  },
  async update(folderId, draft) {
    const folder = mockAppDataStore.updateFolder(folderId, draft)

    return folder
      ? ok(folder)
      : err(domainError.notFound('Folder not found.', 'folder', folderId))
  },
}
