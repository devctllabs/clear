import { act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { createAppServices } from '@core/services'
import { renderHookWithProviders } from '@/test/renderHook'

import { useDeleteTrashItem, useEmptyTrash, useRestoreTrashItem, useTrash } from './useTrash'

describe('trash hooks', () => {
  it('lists, restores, deletes, and empties trash items', async () => {
    const services = createAppServices('mock')
    await services.notes.delete('industrial-revolution-causes')

    const { result } = renderHookWithProviders(() => ({
      deleteItem: useDeleteTrashItem(),
      empty: useEmptyTrash(),
      list: useTrash(),
      restore: useRestoreTrashItem(),
    }), { services })

    await waitFor(() => expect(result.current.list.data?.items.length).toBe(2))
    const items = result.current.list.data?.items ?? []
    const restoredItem = items[0]
    const deletedItem = items[1]

    if (!restoredItem || !deletedItem) {
      throw new Error('Expected initial trash items')
    }

    await act(async () => {
      await result.current.restore.mutateAsync(restoredItem.id)
    })
    await waitFor(() =>
      expect(result.current.list.data?.items.some((item) => item.id === restoredItem.id)).toBe(
        false,
      ),
    )

    await act(async () => {
      await result.current.deleteItem.mutateAsync(deletedItem.id)
    })
    await waitFor(() =>
      expect(result.current.list.data?.items.some((item) => item.id === deletedItem.id)).toBe(
        false,
      ),
    )

    await act(async () => {
      await result.current.empty.mutateAsync()
    })
    await waitFor(() => expect(result.current.list.data?.items).toHaveLength(0))
  })
})
