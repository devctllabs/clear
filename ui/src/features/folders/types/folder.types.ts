import type { SortPreference } from '@shared/types/sort.types'

export const folderSortFields = ['title', 'updatedAt'] as const

export type FolderSortField = (typeof folderSortFields)[number]

export type FolderSortPreference = SortPreference<FolderSortField>

export const defaultFolderSortPreference: FolderSortPreference = {
  direction: 'asc',
  field: 'title',
}

export type Folder = {
  description: string
  id: string
  name: string
  parentId: string
  updatedAt: string
  workspaceId: string
}

export type FolderDraft = {
  description: string
  name: string
  parentId: string
}
