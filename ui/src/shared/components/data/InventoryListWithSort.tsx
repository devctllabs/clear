import type { ReactNode } from 'react'

import type { SortPreference } from '@shared/types/sort.types'

import { InventoryList, InventorySection } from './InventoryList'
import type { InventoryListProps } from './InventoryList'
import { SortMenu, type SortFieldOption } from './SortMenu'

export type InventoryListWithSortProps<TItem> = InventoryListProps<TItem> & {
  headerClassName?: string
  onSortChange: (sort: SortPreference) => void
  sectionClassName?: string
  showSort?: boolean
  sort: SortPreference
  sortAriaLabel: string
  sortFieldOptions: readonly SortFieldOption[]
  title: ReactNode
}

export const InventoryListWithSort = <TItem,>({
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
}: InventoryListWithSortProps<TItem>) => {
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
