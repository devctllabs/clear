import type { WorkspaceService } from '@features/workspaces/services/workspaceService'
import type { Workspace, WorkspaceDraft } from '@features/workspaces/types/workspace.types'
import { mockApi } from '@platform/mock/mockApi'
import { toMockDomainResult, toMockVoidDomainResult } from '@platform/mock/mockDomainResult'

export const mockWorkspaceService: WorkspaceService = {
  async create(draft) {
    return toMockDomainResult(
      () => mockApi.workspacesService.createWorkspace(toWorkspaceDraft(draft)),
      toWorkspace,
    )
  },
  async delete(workspaceId) {
    return toMockDomainResult(
      () => mockApi.workspacesService.deleteWorkspace(workspaceId),
      ({ activeWorkspaceId }) => activeWorkspaceId,
    )
  },
  async getActiveId() {
    return toMockDomainResult(
      () => mockApi.workspacesService.getActiveWorkspace(),
      ({ workspaceId }) => workspaceId,
    )
  },
  async getById(workspaceId) {
    return toMockDomainResult(
      () => mockApi.workspacesService.getWorkspace(workspaceId),
      toWorkspace,
    )
  },
  async list() {
    return toMockDomainResult(
      () => mockApi.workspacesService.listWorkspaces(),
      (result) => ({
        activeWorkspaceId: result.activeWorkspaceId,
        workspaces: result.workspaces.map(toWorkspace),
      }),
    )
  },
  async setActiveId(workspaceId) {
    return toMockVoidDomainResult(() =>
      mockApi.workspacesService.setActiveWorkspace(workspaceId),
    )
  },
  async update(workspaceId, draft) {
    return toMockDomainResult(
      () => mockApi.workspacesService.updateWorkspace(workspaceId, toWorkspaceDraft(draft)),
      toWorkspace,
    )
  },
}

const toWorkspace = (workspace: unknown): Workspace => workspace as Workspace

const toWorkspaceDraft = (draft: WorkspaceDraft) => draft
