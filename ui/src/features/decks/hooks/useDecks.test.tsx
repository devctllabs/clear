import { act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { defaultDeckVisualIcon } from '../constants/visuals'
import { renderHookWithProviders } from '@/test/renderHook'

import {
  useCreateDeck,
  useDeck,
  useDecksInFolder,
  useDeleteDeck,
  useUpdateDeck,
  useWorkspaceRootDecks,
} from './useDecks'

describe('deck hooks', () => {
  it('reads deck data and mutates decks through the service layer', async () => {
    const { result } = renderHookWithProviders(() => ({
      create: useCreateDeck(),
      delete: useDeleteDeck(),
      detail: useDeck('world-history'),
      folderList: useDecksInFolder('reading-notes'),
      rootList: useWorkspaceRootDecks('independent-study'),
      update: useUpdateDeck('world-history'),
    }))

    await waitFor(() =>
      expect(
        result.current.rootList.data?.some(
          (deck) => deck.title === 'Cognitive Biases',
        ),
      ).toBe(true),
    )
    expect(result.current.detail.data?.totalNotes).toBe(2)

    let createdId = ''
    await act(async () => {
      const created = await result.current.create.mutateAsync({
        description: 'Deck created by hook test.',
        icon: defaultDeckVisualIcon,
        parentId: 'reading-notes',
        title: 'Hook Deck',
      })
      createdId = created.id
    })

    await waitFor(() =>
      expect(result.current.folderList.data?.some((deck) => deck.id === createdId)).toBe(true),
    )

    await act(async () => {
      await result.current.update.mutateAsync({
        description: 'Deck updated by hook test.',
        icon: defaultDeckVisualIcon,
        parentId: 'reading-notes',
        title: 'World History Updated',
      })
    })

    await waitFor(() =>
      expect(result.current.detail.data?.title).toBe('World History Updated'),
    )

    await act(async () => {
      await result.current.delete.mutateAsync(createdId)
    })

    await waitFor(() =>
      expect(result.current.folderList.data?.some((deck) => deck.id === createdId)).toBe(false),
    )
  })
})
