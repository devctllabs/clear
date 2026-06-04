import {
  createFolder as apiCreateFolder,
  deleteFolder as apiDeleteFolder,
  listFolderFolders as apiListFolderFolders,
  getFolder as apiGetFolder,
  getFolderPath as apiGetFolderPath,
  listWorkspaceFolders as apiListWorkspaceFolders,
  updateFolder as apiUpdateFolder,
} from '@api-generated/clear-api'
import type {
  Folder as ApiFolder,
  FolderDraft as ApiFolderDraft,
  FolderSortField as ApiFolderSortField,
} from '@api-generated/clear-api'

import type { FolderService } from '@features/folders/services/folderService'
import type { Folder, FolderDraft } from '@features/folders/types/folder.types'
import { toSortQuery } from '@shared/services/api/adapters/sortQuery'
import {
  toDomainResult,
  toVoidDomainResult,
} from '@shared/services/api/sdk-result'

export const webFolderService: FolderService = {
  create(draft) {
    return toDomainResult(
      apiCreateFolder({ body: toFolderDraft(draft) }),
      toFolder,
      'Failed to create folder.',
    )
  },
  delete(folderId) {
    return toVoidDomainResult(
      apiDeleteFolder({ path: { folderId } }),
      'Failed to delete folder.',
    )
  },
  getById(folderId) {
    return toDomainResult(
      apiGetFolder({ path: { folderId } }),
      toFolder,
      'Failed to load folder.',
    )
  },
  getPath(folderId) {
    return toDomainResult(
      apiGetFolderPath({ path: { folderId } }),
      (path) => path.segments,
      'Failed to load folder path.',
    )
  },
  listFolderChildren(folderId, sort) {
    const query = toSortQuery(sort) as {
      sortDirection?: 'asc' | 'desc'
      sortField?: ApiFolderSortField
    }

    return toDomainResult(
      apiListFolderFolders({ path: { folderId }, query }),
      (folders) => folders.map(toFolder),
      'Failed to load folders.',
    )
  },
  listWorkspaceRoot(workspaceId, sort) {
    const query = toSortQuery(sort) as {
      sortDirection?: 'asc' | 'desc'
      sortField?: ApiFolderSortField
    }

    return toDomainResult(
      apiListWorkspaceFolders({ path: { workspaceId }, query }),
      (folders) => folders.map(toFolder),
      'Failed to load folders.',
    )
  },
  update(folderId, draft) {
    return toDomainResult(
      apiUpdateFolder({
        body: toFolderDraft(draft),
        path: { folderId },
      }),
      toFolder,
      'Failed to update folder.',
    )
  },
}

const toFolder = (folder: ApiFolder): Folder => folder

const toFolderDraft = (draft: FolderDraft): ApiFolderDraft => draft
