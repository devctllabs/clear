import type { SortPreference } from '@shared/types/sort.types'

export const toSortQuery = <TField extends string>(sort?: SortPreference<TField>) =>
  sort
    ? {
        sortDirection: sort.direction,
        sortField: sort.field,
      }
    : {}
