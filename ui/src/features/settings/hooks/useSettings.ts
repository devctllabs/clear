import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { unwrapDomainResult } from '@core/query/domain-query'
import { useServices } from '@core/services'

import type { Settings } from '../types/settings.types'

export const settingsKeys = {
  detail: ['settings'] as const,
}

export const useSettings = () => {
  const { settings: settingsService } = useServices()

  return useQuery({
    queryKey: settingsKeys.detail,
    queryFn: () => unwrapDomainResult(settingsService.read()),
  })
}

export const useWriteSettings = () => {
  const queryClient = useQueryClient()
  const { settings: settingsService } = useServices()

  return useMutation({
    mutationFn: (settings: Settings) => unwrapDomainResult(settingsService.write(settings)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: settingsKeys.detail })
    },
  })
}

export const useResetSettings = () => {
  const queryClient = useQueryClient()
  const { settings: settingsService } = useServices()

  return useMutation({
    mutationFn: () => unwrapDomainResult(settingsService.reset()),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: settingsKeys.detail })
    },
  })
}
