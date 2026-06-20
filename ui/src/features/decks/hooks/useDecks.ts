import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { unwrapDomainResult } from '@core/query/domain-query'
import { useServices } from '@core/services'

import type { DeckDraft, DeckSortPreference } from '../types/deck.types'

export const deckKeys = {
  all: ['decks'] as const,
  detail: (deckId: string) => ['decks', deckId] as const,
  folderChildren: (folderId: string, sort?: DeckSortPreference) =>
    ['decks', 'folderChildren', folderId, sort ?? 'default'] as const,
  workspaceRoot: (workspaceId: string, sort?: DeckSortPreference) =>
    ['decks', 'workspaceRoot', workspaceId, sort ?? 'default'] as const,
}

export const useWorkspaceRootDecks = (workspaceId: string, sort?: DeckSortPreference) => {
  const { decks } = useServices()

  return useQuery({
    enabled: workspaceId.length > 0,
    queryKey: deckKeys.workspaceRoot(workspaceId, sort),
    queryFn: () => unwrapDomainResult(decks.listWorkspaceRoot(workspaceId, sort)),
    placeholderData: keepPreviousData,
  })
}

export const useDecksInFolder = (folderId: string, sort?: DeckSortPreference) => {
  const { decks } = useServices()

  return useQuery({
    enabled: folderId.length > 0,
    queryKey: deckKeys.folderChildren(folderId, sort),
    queryFn: () => unwrapDomainResult(decks.listFolderChildren(folderId, sort)),
    placeholderData: keepPreviousData,
  })
}

export const useDeck = (deckId: string) => {
  const { decks } = useServices()

  return useQuery({
    enabled: deckId.length > 0,
    queryKey: deckKeys.detail(deckId),
    queryFn: () => unwrapDomainResult(decks.getById(deckId)),
  })
}

export const useCreateDeck = () => {
  const queryClient = useQueryClient()
  const { decks } = useServices()

  return useMutation({
    mutationFn: (draft: DeckDraft) => unwrapDomainResult(decks.create(draft)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: deckKeys.all })
    },
  })
}

export const useUpdateDeck = (deckId: string) => {
  const queryClient = useQueryClient()
  const { decks } = useServices()

  return useMutation({
    mutationFn: (draft: DeckDraft) => unwrapDomainResult(decks.update(deckId, draft)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: deckKeys.all })
      void queryClient.invalidateQueries({ queryKey: deckKeys.detail(deckId) })
    },
  })
}

export const useDeleteDeck = () => {
  const queryClient = useQueryClient()
  const { decks } = useServices()

  return useMutation({
    mutationFn: (deckId: string) => unwrapDomainResult(decks.delete(deckId)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: deckKeys.all })
    },
  })
}
