import {
  createWorkspace as apiCreateWorkspace,
  deleteWorkspace as apiDeleteWorkspace,
  getActiveWorkspace as apiGetActiveWorkspace,
  getWorkspace as apiGetWorkspace,
  listWorkspaces as apiListWorkspaces,
  setActiveWorkspace as apiSetActiveWorkspace,
  updateWorkspace as apiUpdateWorkspace,
} from '@api-generated/clear-api'
import type {
  Workspace as ApiWorkspace,
  WorkspaceDraft as ApiWorkspaceDraft,
  WorkspaceListResult as ApiWorkspaceListResult,
} from '@api-generated/clear-api'

import type { WorkspaceService } from '@features/workspaces/services/workspaceService'
import type {
  Workspace,
  WorkspaceDraft,
  WorkspaceListResult,
} from '@features/workspaces/types/workspace.types'
import {
  toDomainResult,
  toVoidDomainResult,
} from '@shared/services/api/sdk-result'

export const webWorkspaceService: WorkspaceService = {
  create(draft) {
    return toDomainResult(
      apiCreateWorkspace({ body: toWorkspaceDraft(draft) }),
      toWorkspace,
      'Failed to create workspace.',
    )
  },
  delete(workspaceId) {
    return toDomainResult(
      apiDeleteWorkspace({ path: { workspaceId } }),
      ({ activeWorkspaceId }) => activeWorkspaceId,
      'Failed to delete workspace.',
    )
  },
  getActiveId() {
    return toDomainResult(
      apiGetActiveWorkspace(),
      ({ workspaceId }) => workspaceId,
      'Failed to load active workspace.',
    )
  },
  getById(workspaceId) {
    return toDomainResult(
      apiGetWorkspace({ path: { workspaceId } }),
      toWorkspace,
      'Failed to load workspace.',
    )
  },
  list() {
    return toDomainResult(
      apiListWorkspaces(),
      toWorkspaceListResult,
      'Failed to load workspaces.',
    )
  },
  setActiveId(workspaceId) {
    return toVoidDomainResult(
      apiSetActiveWorkspace({ body: { workspaceId } }),
      'Failed to set active workspace.',
    )
  },
  update(workspaceId, draft) {
    return toDomainResult(
      apiUpdateWorkspace({
        body: toWorkspaceDraft(draft),
        path: { workspaceId },
      }),
      toWorkspace,
      'Failed to update workspace.',
    )
  },
}

const toWorkspace = (workspace: ApiWorkspace): Workspace => workspace as Workspace

const toWorkspaceListResult = (result: ApiWorkspaceListResult): WorkspaceListResult => ({
  activeWorkspaceId: result.activeWorkspaceId,
  workspaces: result.workspaces.map(toWorkspace),
})

const toWorkspaceDraft = (draft: WorkspaceDraft): ApiWorkspaceDraft =>
  draft as ApiWorkspaceDraft
