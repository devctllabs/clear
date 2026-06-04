import type { SortPreference } from '@shared/types/sort.types'

export const toSortQuery = (sort?: SortPreference) =>
  sort
    ? {
        sortDirection: sort.direction,
        sortField: sort.field,
      }
    : {}
