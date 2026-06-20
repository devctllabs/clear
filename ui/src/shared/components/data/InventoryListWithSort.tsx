import type { ReactNode } from 'react'

import type { SortPreference } from '@shared/types/sort.types'

import { InventoryList, InventorySection } from './InventoryList'
import type { InventoryListProps } from './InventoryList'
import { SortMenu, type SortFieldOption } from './SortMenu'

export type InventoryListWithSortProps<TItem, TField extends string> =
  InventoryListProps<TItem> & {
  headerClassName?: string
  onSortChange: (sort: SortPreference<TField>) => void
  sectionClassName?: string
  showSort?: boolean
  sort: SortPreference<TField>
  sortAriaLabel: string
  sortFieldOptions: readonly SortFieldOption<TField>[]
  title: ReactNode
}

export const InventoryListWithSort = <TItem, TField extends string>({
  headerClassName,
  items,
  onSortChange,
  sectionClassName,
  showSort = true,
  sort,
  sortAriaLabel,
  sortFieldOptions,
  title,
  ...listProps
}: InventoryListWithSortProps<TItem, TField>) => {
  if (items.length === 0) {
    return null
  }

  return (
    <InventorySection
      actionSlot={
        showSort ? (
          <SortMenu
            ariaLabel={sortAriaLabel}
            fieldOptions={sortFieldOptions}
            sort={sort}
            onDirectionChange={(direction) => {
              onSortChange({ ...sort, direction })
            }}
            onFieldChange={(field) => {
              onSortChange({ ...sort, field })
            }}
          />
        ) : null
      }
      className={sectionClassName}
      headerClassName={headerClassName}
      title={title}
    >
      <InventoryList
        {...listProps}
        items={items}
      />
    </InventorySection>
  )
}
