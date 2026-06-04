import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { unwrapDomainResult } from '@core/query/domain-query'
import { useServices } from '@core/services'

import type { WorkspaceDraft } from '../types/workspace.types'

export const workspaceKeys = {
  active: ['workspaces', 'active'] as const,
  all: ['workspaces'] as const,
  detail: (workspaceId: string) => ['workspaces', workspaceId] as const,
}

export const useWorkspaces = () => {
  const { workspaces } = useServices()

  return useQuery({
    queryKey: workspaceKeys.all,
    queryFn: () => unwrapDomainResult(workspaces.list()),
  })
}

export const useWorkspace = (workspaceId: string) => {
  const { workspaces } = useServices()

  return useQuery({
    enabled: workspaceId.length > 0,
    queryKey: workspaceKeys.detail(workspaceId),
    queryFn: () => unwrapDomainResult(workspaces.getById(workspaceId)),
  })
}

export const useActiveWorkspaceId = () => {
  const { workspaces } = useServices()

  return useQuery({
    queryKey: workspaceKeys.active,
    queryFn: () => unwrapDomainResult(workspaces.getActiveId()),
  })
}

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient()
  const { workspaces } = useServices()

  return useMutation({
    mutationFn: (draft: WorkspaceDraft) => unwrapDomainResult(workspaces.create(draft)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workspaceKeys.all })
      void queryClient.invalidateQueries({ queryKey: workspaceKeys.active })
    },
  })
}

export const useUpdateWorkspace = (workspaceId: string) => {
  const queryClient = useQueryClient()
  const { workspaces } = useServices()

  return useMutation({
    mutationFn: (draft: WorkspaceDraft) =>
      unwrapDomainResult(workspaces.update(workspaceId, draft)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workspaceKeys.all })
      void queryClient.invalidateQueries({ queryKey: workspaceKeys.detail(workspaceId) })
    },
  })
}

export const useDeleteWorkspace = () => {
  const queryClient = useQueryClient()
  const { workspaces } = useServices()

  return useMutation({
    mutationFn: (workspaceId: string) => unwrapDomainResult(workspaces.delete(workspaceId)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workspaceKeys.all })
      void queryClient.invalidateQueries({ queryKey: workspaceKeys.active })
    },
  })
}

export const useSetActiveWorkspace = () => {
  const queryClient = useQueryClient()
  const { workspaces } = useServices()

  return useMutation({
    mutationFn: (workspaceId: string) =>
      unwrapDomainResult(workspaces.setActiveId(workspaceId)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: workspaceKeys.all })
      void queryClient.invalidateQueries({ queryKey: workspaceKeys.active })
    },
  })
}
