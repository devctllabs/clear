import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiMocks = vi.hoisted(() => ({
  createFolder: vi.fn(),
  deleteFolder: vi.fn(),
  getFolder: vi.fn(),
  getFolderPath: vi.fn(),
  listFolderFolders: vi.fn(),
  listWorkspaceFolders: vi.fn(),
  updateFolder: vi.fn(),
}))

const folder = {
  description: 'Reference materials.',
  id: 'reading-notes',
  name: 'Reading Notes',
  parentId: 'independent-study',
  updatedAt: '2026-05-15T12:00:00.000Z',
  workspaceId: 'independent-study',
}

const loadWebFolderService = async () => {
  vi.doMock('@api-generated/clear-api', () => apiMocks)

  return (await import('./folderService')).webFolderService
}

describe('webFolderService', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('uses the workspace endpoint for root folders', async () => {
    apiMocks.listWorkspaceFolders.mockResolvedValue({ data: [folder] })
    const webFolderService = await loadWebFolderService()

    const result = await webFolderService.listWorkspaceRoot('independent-study', {
      direction: 'asc',
      field: 'title',
    })

    expect(result.ok ? result.value : []).toEqual([folder])
    expect(apiMocks.listWorkspaceFolders).toHaveBeenCalledWith({
      path: { workspaceId: 'independent-study' },
      query: { sortDirection: 'asc', sortField: 'title' },
    })
    expect(apiMocks.listFolderFolders).not.toHaveBeenCalled()
  })

  it('uses the folder endpoint for nested folders', async () => {
    apiMocks.listFolderFolders.mockResolvedValue({ data: [folder] })
    const webFolderService = await loadWebFolderService()

    const result = await webFolderService.listFolderChildren('reading-notes')

    expect(result.ok ? result.value : []).toEqual([folder])
    expect(apiMocks.listFolderFolders).toHaveBeenCalledWith({
      path: { folderId: 'reading-notes' },
      query: {},
    })
    expect(apiMocks.listWorkspaceFolders).not.toHaveBeenCalled()
  })

  it('maps folder path response segments', async () => {
    apiMocks.getFolderPath.mockResolvedValue({
      data: { segments: ['Reading Notes', 'History'] },
    })
    const webFolderService = await loadWebFolderService()

    const result = await webFolderService.getPath('history')

    expect(result.ok ? result.value : []).toEqual(['Reading Notes', 'History'])
    expect(apiMocks.getFolderPath).toHaveBeenCalledWith({
      path: { folderId: 'history' },
    })
  })
})
