import type { DomainResult } from '@shared/errors'

import type {
  Workspace,
  WorkspaceDraft,
  WorkspaceListResult,
} from '../types/workspace.types'

export interface WorkspaceService {
  create(draft: WorkspaceDraft): DomainResult<Workspace>
  delete(workspaceId: string): DomainResult<string | null>
  getActiveId(): DomainResult<string>
  getById(workspaceId: string): DomainResult<Workspace>
  list(): DomainResult<WorkspaceListResult>
  setActiveId(workspaceId: string): DomainResult<void>
  update(workspaceId: string, draft: WorkspaceDraft): DomainResult<Workspace>
}
