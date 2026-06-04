import { act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { defaultWorkspaceVisualIcon } from '../constants/visuals'
import { renderHookWithProviders } from '@/test/renderHook'

import {
  useActiveWorkspaceId,
  useCreateWorkspace,
  useDeleteWorkspace,
  useSetActiveWorkspace,
  useUpdateWorkspace,
  useWorkspace,
  useWorkspaces,
} from './useWorkspaces'

describe('workspace hooks', () => {
  it('reads, creates, updates, activates, and deletes workspaces', async () => {
    const { result } = renderHookWithProviders(() => ({
      active: useActiveWorkspaceId(),
      create: useCreateWorkspace(),
      delete: useDeleteWorkspace(),
      detail: useWorkspace('independent-study'),
      list: useWorkspaces(),
      setActive: useSetActiveWorkspace(),
      update: useUpdateWorkspace('reading-archive'),
    }))

    await waitFor(() => expect(result.current.list.data?.workspaces).toHaveLength(2))
    expect(result.current.list.data?.activeWorkspaceId).toBe('independent-study')
    expect(result.current.active.data).toBe('independent-study')
    expect(result.current.detail.data?.title).toBe('Independent Study')

    await act(async () => {
      await result.current.create.mutateAsync({
        description: 'Created from a hook test.',
        icon: defaultWorkspaceVisualIcon,
        title: 'Hook Workspace',
      })
    })

    await waitFor(() =>
      expect(
        result.current.list.data?.workspaces.some(
          (workspace) => workspace.title === 'Hook Workspace',
        ),
      ).toBe(true),
    )

    await act(async () => {
      await result.current.update.mutateAsync({
        description: 'Updated from hooks.',
        icon: defaultWorkspaceVisualIcon,
        title: 'Research Hook Archive',
      })
    })

    await waitFor(() =>
      expect(
        result.current.list.data?.workspaces.some(
          (workspace) => workspace.title === 'Research Hook Archive',
        ),
      ).toBe(true),
    )

    await act(async () => {
      await result.current.setActive.mutateAsync('reading-archive')
    })
    await waitFor(() => expect(result.current.active.data).toBe('reading-archive'))

    await act(async () => {
      await result.current.delete.mutateAsync('reading-archive')
    })
    await waitFor(() =>
      expect(
        result.current.list.data?.workspaces.some(
          (workspace) => workspace.id === 'reading-archive',
        ),
      ).toBe(false),
    )
  })
})
