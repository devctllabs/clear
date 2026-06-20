import type { FolderRecord } from '../../generated/mock-admin/contract/index.ts'
import { notFound } from '../../generated/clear-web-api/mock-runtime.ts'
import type { MockStateStore } from '../../lib/stateStore.ts'
import { visible } from '../../lib/softDelete.ts'
import { byStringField } from '../../lib/sort.ts'

type SortDirection = 'asc' | 'desc'
type FolderSortField = 'title' | 'updatedAt'

const sortFolders = (
  folders: FolderRecord[],
  sortField?: FolderSortField,
  sortDirection: SortDirection = 'asc',
) => {
  if (!sortField) {
    return folders
  }

  const direction = sortDirection === 'desc' ? -1 : 1

  return [...folders].sort((left, right) => {
    if (sortField === 'updatedAt') {
      return left.updatedAt.localeCompare(right.updatedAt) * direction
    }

    return byStringField<FolderRecord>('name', sortDirection)(left, right)
  })
}

export class FolderRepository {
  private readonly stateStore: MockStateStore

  constructor(stateStore: MockStateStore) {
    this.stateStore = stateStore
  }

  all() {
    return this.stateStore.findEntities('folders')
  }

  visible() {
    return visible(this.all())
  }

  find(folderId: string) {
    return this.stateStore.findEntity('folders', folderId)
  }

  require(folderId: string, options: { includeDeleted?: boolean } = {}) {
    const candidates = options.includeDeleted ? this.all() : this.visible()
    const folder = candidates.find((candidate) => candidate.id === folderId)

    if (!folder) {
      throw notFound('folder', folderId)
    }

    return folder
  }

  async create(folder: FolderRecord) {
    return this.stateStore.createEntity('folders', folder, { prepend: true })
  }

  async update(folderId: string, updater: (folder: FolderRecord) => FolderRecord) {
    return (
      await this.stateStore.updateEntity('folders', folderId, updater)
    ) ?? this.require(folderId, { includeDeleted: true })
  }

  async touch(folderId: string, updatedAt: string) {
    return this.update(folderId, (folder) => ({ ...folder, updatedAt }))
  }

  async markDeleted(folderId: string, deletedAt: string) {
    return this.update(folderId, (folder) => ({ ...folder, deletedAt }))
  }

  async restore(folderId: string) {
    return this.update(folderId, (folder) => {
      const { deletedAt: _deletedAt, ...restored } = folder
      return restored
    })
  }

  async remove(folderId: string) {
    return this.stateStore.deleteEntity('folders', folderId)
  }

  listByWorkspace(workspaceId: string, options: { sortField?: FolderSortField; sortDirection?: SortDirection } = {}) {
    const folders = this.visible().filter(
      (folder) => folder.workspaceId === workspaceId && folder.parentId === workspaceId,
    )

    return sortFolders(folders, options.sortField, options.sortDirection)
  }

  listByParent(parentId: string, options: { sortField?: FolderSortField; sortDirection?: SortDirection } = {}) {
    const folders = this.visible().filter((folder) => folder.parentId === parentId)

    return sortFolders(folders, options.sortField, options.sortDirection)
  }

  visibleDescendants(folderId: string): FolderRecord[] {
    const children = this.visible().filter((folder) => folder.parentId === folderId)

    return children.flatMap((child) => [child, ...this.visibleDescendants(child.id ?? '')])
  }

  ancestorChain(folderId: string): FolderRecord[] {
    const folder = this.require(folderId)

    if (folder.parentId === folder.workspaceId) {
      return [folder]
    }

    return [...this.ancestorChain(folder.parentId), folder]
  }
}
