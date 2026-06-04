import type { WorkspaceRecord } from '../../generated/mock-admin/contract/index.ts'
import { notFound } from '../../generated/clear-web-api/mock-runtime.ts'
import type { MockStateRepository } from '../../generated/mock-admin/state/repository.ts'
import { visible } from '../../lib/softDelete.ts'
import { byStringField } from '../../lib/sort.ts'

export class WorkspaceRepository {
  constructor(private readonly stateStore: MockStateRepository) {}

  all() {
    return this.stateStore.getSlice('workspaces')
  }

  visible() {
    return visible(this.all())
  }

  find(workspaceId: string) {
    return this.all().find((workspace) => workspace.id === workspaceId)
  }

  require(workspaceId: string, options: { includeDeleted?: boolean } = {}) {
    const candidates = options.includeDeleted ? this.all() : this.visible()
    const workspace = candidates.find((candidate) => candidate.id === workspaceId)

    if (!workspace) {
      throw notFound('workspace', workspaceId)
    }

    return workspace
  }

  list() {
    return this.visible()
  }

  getActiveWorkspace() {
    return this.stateStore.getSlice('activeWorkspace')
  }

  setActiveWorkspace(workspaceId: string) {
    this.stateStore.setSlice('activeWorkspace', { workspaceId })
  }

  create(workspace: WorkspaceRecord) {
    this.stateStore.setSlice('workspaces', [workspace, ...this.all()])
    return workspace
  }

  update(workspaceId: string, updater: (workspace: WorkspaceRecord) => WorkspaceRecord) {
    let next: WorkspaceRecord | undefined

    this.stateStore.setSlice('workspaces', this.all().map((workspace) => {
      if (workspace.id !== workspaceId) {
        return workspace
      }

      next = updater(workspace)

      return next
    }))

    return next ?? this.require(workspaceId, { includeDeleted: true })
  }

  touch(workspaceId: string, updatedAt: string) {
    return this.update(workspaceId, (workspace) => ({ ...workspace, updatedAt }))
  }

  markDeleted(workspaceId: string, deletedAt: string) {
    return this.update(workspaceId, (workspace) => ({ ...workspace, deletedAt }))
  }

  restore(workspaceId: string) {
    return this.update(workspaceId, (workspace) => {
      const { deletedAt: _deletedAt, ...restored } = workspace
      return restored
    })
  }

  remove(workspaceId: string) {
    const existing = this.find(workspaceId)

    if (!existing) {
      return undefined
    }

    this.stateStore.setSlice(
      'workspaces',
      this.all().filter((workspace) => workspace.id !== workspaceId),
    )

    return existing
  }

  firstVisibleOtherThan(workspaceId: string) {
    return this.visible().find((workspace) => workspace.id !== workspaceId)
  }

  sortWorkspaces(workspaces: WorkspaceRecord[]) {
    return [...workspaces].sort(byStringField<WorkspaceRecord>('title'))
  }
}
