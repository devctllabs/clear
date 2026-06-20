export type SortDirection = 'asc' | 'desc'

export type SortPreference<TField extends string> = {
  direction: SortDirection
  field: TField
}
