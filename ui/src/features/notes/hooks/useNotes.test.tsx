import { act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderHookWithProviders } from '@/test/renderHook'

import {
  useCreateNote,
  useDeleteNote,
  useNote,
  useNotesByDeck,
  useUpdateNote,
} from './useNotes'

describe('note hooks', () => {
  it('reads note data and mutates notes through the service layer', async () => {
    const { result } = renderHookWithProviders(() => ({
      create: useCreateNote(),
      delete: useDeleteNote(),
      detail: useNote('world-history', 'industrial-revolution-causes'),
      list: useNotesByDeck('world-history'),
      update: useUpdateNote('industrial-revolution-causes'),
    }))

    await waitFor(() =>
      expect(result.current.list.data?.some((note) => note.title === 'Industrial Revolution Causes')).toBe(
        true,
      ),
    )
    expect(result.current.detail.data?.kind).toBe('basic')

    let createdId = ''
    await act(async () => {
      const created = await result.current.create.mutateAsync({
        deckId: 'world-history',
        editor: { back: 'Hook back', front: 'Hook front' },
        kind: 'basic',
        title: 'Hook Note',
      })
      createdId = created.id
    })

    await waitFor(() =>
      expect(result.current.list.data?.some((note) => note.id === createdId)).toBe(true),
    )

    await act(async () => {
      await result.current.update.mutateAsync({
        deckId: 'world-history',
        editor: { back: 'Updated back', front: 'Updated front' },
        kind: 'basic',
        title: 'Industrial Hook Update',
      })
    })

    await waitFor(() =>
      expect(result.current.detail.data?.title).toBe('Industrial Hook Update'),
    )

    await act(async () => {
      await result.current.delete.mutateAsync(createdId)
    })

    await waitFor(() =>
      expect(result.current.list.data?.some((note) => note.id === createdId)).toBe(false),
    )
  })
})
