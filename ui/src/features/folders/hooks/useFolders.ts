import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { unwrapDomainResult } from '@core/query/domain-query'
import { useServices } from '@core/services'

import type { FolderDraft, FolderSortPreference } from '../types/folder.types'

export const folderKeys = {
  all: ['folders'] as const,
  detail: (folderId: string) => ['folders', folderId] as const,
  folderChildren: (folderId: string, sort?: FolderSortPreference) =>
    ['folders', 'folderChildren', folderId, sort ?? 'default'] as const,
  path: (folderId: string) => ['folders', folderId, 'path'] as const,
  workspaceRoot: (workspaceId: string, sort?: FolderSortPreference) =>
    ['folders', 'workspaceRoot', workspaceId, sort ?? 'default'] as const,
}

export const useWorkspaceRootFolders = (
  workspaceId: string,
  sort?: FolderSortPreference,
) => {
  const { folders } = useServices()

  return useQuery({
    enabled: workspaceId.length > 0,
    queryKey: folderKeys.workspaceRoot(workspaceId, sort),
    queryFn: () => unwrapDomainResult(folders.listWorkspaceRoot(workspaceId, sort)),
    placeholderData: keepPreviousData,
  })
}

export const useFoldersInFolder = (folderId: string, sort?: FolderSortPreference) => {
  const { folders } = useServices()

  return useQuery({
    enabled: folderId.length > 0,
    queryKey: folderKeys.folderChildren(folderId, sort),
    queryFn: () => unwrapDomainResult(folders.listFolderChildren(folderId, sort)),
    placeholderData: keepPreviousData,
  })
}

export const useFolder = (folderId: string) => {
  const { folders } = useServices()

  return useQuery({
    enabled: folderId.length > 0,
    queryKey: folderKeys.detail(folderId),
    queryFn: () => unwrapDomainResult(folders.getById(folderId)),
  })
}

export const useFolderPath = (folderId: string) => {
  const { folders } = useServices()

  return useQuery({
    enabled: folderId.length > 0,
    queryKey: folderKeys.path(folderId),
    queryFn: () => unwrapDomainResult(folders.getPath(folderId)),
  })
}

export const useCreateFolder = () => {
  const queryClient = useQueryClient()
  const { folders } = useServices()

  return useMutation({
    mutationFn: (draft: FolderDraft) => unwrapDomainResult(folders.create(draft)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: folderKeys.all })
    },
  })
}

export const useUpdateFolder = (folderId: string) => {
  const queryClient = useQueryClient()
  const { folders } = useServices()

  return useMutation({
    mutationFn: (draft: FolderDraft) =>
      unwrapDomainResult(folders.update(folderId, draft)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: folderKeys.all })
    },
  })
}

export const useDeleteFolder = () => {
  const queryClient = useQueryClient()
  const { folders } = useServices()

  return useMutation({
    mutationFn: (folderId: string) => unwrapDomainResult(folders.delete(folderId)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: folderKeys.all })
    },
  })
}
