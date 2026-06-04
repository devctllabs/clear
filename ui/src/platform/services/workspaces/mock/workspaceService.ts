import type { WorkspaceService } from '@features/workspaces/services/workspaceService'
import { domainError, err, ok } from '@shared/errors'
import { mockAppDataStore } from '@platform/mock/mockAppDataStore'

export const mockWorkspaceService: WorkspaceService = {
  async create(draft) {
    return ok(mockAppDataStore.createWorkspace(draft))
  },
  async delete(workspaceId) {
    return ok(mockAppDataStore.deleteWorkspace(workspaceId))
  },
  async getActiveId() {
    return ok(mockAppDataStore.getActiveWorkspaceId())
  },
  async getById(workspaceId) {
    const workspace = mockAppDataStore.getWorkspaceById(workspaceId)

    return workspace
      ? ok(workspace)
      : err(domainError.notFound('Workspace not found.', 'workspace', workspaceId))
  },
  async list() {
    const workspaces = mockAppDataStore.listWorkspaces()

    return ok({
      activeWorkspaceId: workspaces.length > 0 ? mockAppDataStore.getActiveWorkspaceId() : null,
      workspaces,
    })
  },
  async setActiveId(workspaceId) {
    const workspace = mockAppDataStore.getWorkspaceById(workspaceId)

    if (!workspace) {
      return err(domainError.notFound('Workspace not found.', 'workspace', workspaceId))
    }

    mockAppDataStore.setActiveWorkspaceId(workspaceId)

    return ok(undefined)
  },
  async update(workspaceId, draft) {
    const workspace = mockAppDataStore.updateWorkspace(workspaceId, draft)

    return workspace
      ? ok(workspace)
      : err(domainError.notFound('Workspace not found.', 'workspace', workspaceId))
  },
}
