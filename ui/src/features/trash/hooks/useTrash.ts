import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { unwrapDomainResult } from '@core/query/domain-query'
import { useServices } from '@core/services'

export const trashKeys = {
  state: ['trash'] as const,
}

export const useTrash = () => {
  const { trash } = useServices()

  return useQuery({
    queryKey: trashKeys.state,
    queryFn: () => unwrapDomainResult(trash.list()),
  })
}

export const useRestoreTrashItem = () => {
  const queryClient = useQueryClient()
  const { trash } = useServices()

  return useMutation({
    mutationFn: (itemId: string) => unwrapDomainResult(trash.restoreItem(itemId)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: trashKeys.state })
      void queryClient.invalidateQueries()
    },
  })
}

export const useDeleteTrashItem = () => {
  const queryClient = useQueryClient()
  const { trash } = useServices()

  return useMutation({
    mutationFn: (itemId: string) => unwrapDomainResult(trash.deleteItem(itemId)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: trashKeys.state })
    },
  })
}

export const useEmptyTrash = () => {
  const queryClient = useQueryClient()
  const { trash } = useServices()

  return useMutation({
    mutationFn: () => unwrapDomainResult(trash.empty()),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: trashKeys.state })
    },
  })
}
