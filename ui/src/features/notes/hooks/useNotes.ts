import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { unwrapDomainResult } from '@core/query/domain-query'
import { useServices } from '@core/services'

import type { NoteDraft, NoteSortPreference } from '../types/note.types'

export const noteKeys = {
  all: ['notes'] as const,
  deck: (deckId: string, sort?: NoteSortPreference) =>
    ['notes', 'deck', deckId, sort ?? 'default'] as const,
  detail: (deckId: string, noteId: string) => ['notes', deckId, noteId] as const,
}

export const useNotesByDeck = (deckId: string, sort?: NoteSortPreference) => {
  const { notes } = useServices()

  return useQuery({
    enabled: deckId.length > 0,
    queryKey: noteKeys.deck(deckId, sort),
    queryFn: () => unwrapDomainResult(notes.listByDeck(deckId, sort)),
    placeholderData: keepPreviousData,
  })
}

export const useNote = (deckId: string, noteId: string) => {
  const { notes } = useServices()

  return useQuery({
    enabled: deckId.length > 0 && noteId.length > 0,
    queryKey: noteKeys.detail(deckId, noteId),
    queryFn: () => unwrapDomainResult(notes.getById(deckId, noteId)),
  })
}

export const useCreateNote = () => {
  const queryClient = useQueryClient()
  const { notes } = useServices()

  return useMutation({
    mutationFn: (draft: NoteDraft) => unwrapDomainResult(notes.create(draft)),
    onSuccess: (note) => {
      void queryClient.invalidateQueries({ queryKey: noteKeys.deck(note.deckId) })
    },
  })
}

export const useUpdateNote = (noteId: string) => {
  const queryClient = useQueryClient()
  const { notes } = useServices()

  return useMutation({
    mutationFn: (draft: NoteDraft) => unwrapDomainResult(notes.update(noteId, draft)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: noteKeys.all })
    },
  })
}

export const useDeleteNote = () => {
  const queryClient = useQueryClient()
  const { notes } = useServices()

  return useMutation({
    mutationFn: (noteId: string) => unwrapDomainResult(notes.delete(noteId)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: noteKeys.all })
    },
  })
}
