import type { FolderRecord } from '../../generated/mock-admin/contract/index.ts'
import { notFound } from '../../generated/clear-web-api/mock-runtime.ts'
import type { MockStateRepository } from '../../generated/mock-admin/state/repository.ts'
import { visible } from '../../lib/softDelete.ts'
import { byStringField } from '../../lib/sort.ts'

type SortDirection = 'asc' | 'desc'
type FolderSortField = 'title' | 'updated'

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
    if (sortField === 'updated') {
      return left.updatedAt.localeCompare(right.updatedAt) * direction
    }

    return byStringField<FolderRecord>('name', sortDirection)(left, right)
  })
}

export class FolderRepository {
  constructor(private readonly stateStore: MockStateRepository) {}

  all() {
    return this.stateStore.getSlice('folders')
  }

  visible() {
    return visible(this.all())
  }

  find(folderId: string) {
    return this.all().find((folder) => folder.id === folderId)
  }

  require(folderId: string, options: { includeDeleted?: boolean } = {}) {
    const candidates = options.includeDeleted ? this.all() : this.visible()
    const folder = candidates.find((candidate) => candidate.id === folderId)

    if (!folder) {
      throw notFound('folder', folderId)
    }

    return folder
  }

  create(folder: FolderRecord) {
    this.stateStore.setSlice('folders', [folder, ...this.all()])
    return folder
  }

  update(folderId: string, updater: (folder: FolderRecord) => FolderRecord) {
    let next: FolderRecord | undefined

    this.stateStore.setSlice('folders', this.all().map((folder) => {
      if (folder.id !== folderId) {
        return folder
      }

      next = updater(folder)

      return next
    }))

    return next ?? this.require(folderId, { includeDeleted: true })
  }

  touch(folderId: string, updatedAt: string) {
    return this.update(folderId, (folder) => ({ ...folder, updatedAt }))
  }

  markDeleted(folderId: string, deletedAt: string) {
    return this.update(folderId, (folder) => ({ ...folder, deletedAt }))
  }

  restore(folderId: string) {
    return this.update(folderId, (folder) => {
      const { deletedAt: _deletedAt, ...restored } = folder
      return restored
    })
  }

  remove(folderId: string) {
    const existing = this.find(folderId)

    if (!existing) {
      return undefined
    }

    this.stateStore.setSlice('folders', this.all().filter((folder) => folder.id !== folderId))

    return existing
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
