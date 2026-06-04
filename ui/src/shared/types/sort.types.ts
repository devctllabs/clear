export type SortDirection = 'asc' | 'desc'
export type SortField = 'dueToday' | 'title' | 'updated'

export type SortPreference = {
  direction: SortDirection
  field: SortField
}

export const defaultSortPreference: SortPreference = {
  direction: 'asc',
  field: 'title',
}
