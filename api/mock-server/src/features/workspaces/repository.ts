import type { WorkspaceRecord } from '../../generated/mock-admin/contract/index.ts'
import { notFound } from '../../generated/clear-web-api/mock-runtime.ts'
import type { MockStateStore } from '../../lib/stateStore.ts'
import { visible } from '../../lib/softDelete.ts'
import { byStringField } from '../../lib/sort.ts'

export class WorkspaceRepository {
  private readonly stateStore: MockStateStore

  constructor(stateStore: MockStateStore) {
    this.stateStore = stateStore
  }

  all() {
    return this.stateStore.findEntities('workspaces')
  }

  visible() {
    return visible(this.all())
  }

  find(workspaceId: string) {
    return this.stateStore.findEntity('workspaces', workspaceId)
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

  async setActiveWorkspace(workspaceId: string) {
    await this.stateStore.setSlice('activeWorkspace', { workspaceId })
  }

  async create(workspace: WorkspaceRecord) {
    return this.stateStore.createEntity('workspaces', workspace, { prepend: true })
  }

  async update(workspaceId: string, updater: (workspace: WorkspaceRecord) => WorkspaceRecord) {
    return (
      await this.stateStore.updateEntity('workspaces', workspaceId, updater)
    ) ?? this.require(workspaceId, { includeDeleted: true })
  }

  async touch(workspaceId: string, updatedAt: string) {
    return this.update(workspaceId, (workspace) => ({ ...workspace, updatedAt }))
  }

  async markDeleted(workspaceId: string, deletedAt: string) {
    return this.update(workspaceId, (workspace) => ({ ...workspace, deletedAt }))
  }

  async restore(workspaceId: string) {
    return this.update(workspaceId, (workspace) => {
      const { deletedAt: _deletedAt, ...restored } = workspace
      return restored
    })
  }

  async remove(workspaceId: string) {
    return this.stateStore.deleteEntity('workspaces', workspaceId)
  }

  firstVisibleOtherThan(workspaceId: string) {
    return this.visible().find((workspace) => workspace.id !== workspaceId)
  }

  sortWorkspaces(workspaces: WorkspaceRecord[]) {
    return [...workspaces].sort(byStringField<WorkspaceRecord>('title'))
  }
}
