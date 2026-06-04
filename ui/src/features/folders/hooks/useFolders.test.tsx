import { act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderHookWithProviders } from '@/test/renderHook'

import {
  useCreateFolder,
  useDeleteFolder,
  useFolder,
  useFolderPath,
  useFoldersInFolder,
  useUpdateFolder,
  useWorkspaceRootFolders,
} from './useFolders'

describe('folder hooks', () => {
  it('reads folder data and mutates folders through the service layer', async () => {
    const { result } = renderHookWithProviders(() => ({
      childList: useFoldersInFolder('reading-notes'),
      create: useCreateFolder(),
      delete: useDeleteFolder(),
      detail: useFolder('reading-notes'),
      path: useFolderPath('history'),
      rootList: useWorkspaceRootFolders('independent-study'),
      update: useUpdateFolder('reading-notes'),
    }))

    await waitFor(() =>
      expect(result.current.rootList.data?.some((folder) => folder.name === 'Reading Notes')).toBe(
        true,
      ),
    )
    expect(result.current.detail.data?.name).toBe('Reading Notes')
    expect(result.current.path.data).toEqual(['Reading Notes', 'History'])

    let createdId = ''
    await act(async () => {
      const created = await result.current.create.mutateAsync({
        description: 'Folder created by hook test.',
        name: 'Hook Child Folder',
        parentId: 'reading-notes',
      })
      createdId = created.id
    })

    await waitFor(() =>
      expect(result.current.childList.data?.some((folder) => folder.id === createdId)).toBe(true),
    )

    await act(async () => {
      await result.current.update.mutateAsync({
        description: 'Updated folder from hook test.',
        name: 'Reading Notes Updated',
        parentId: 'independent-study',
      })
    })

    await waitFor(() => expect(result.current.detail.data?.name).toBe('Reading Notes Updated'))

    await act(async () => {
      await result.current.delete.mutateAsync(createdId)
    })

    await waitFor(() =>
      expect(result.current.childList.data?.some((folder) => folder.id === createdId)).toBe(false),
    )
  })
})
