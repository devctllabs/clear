import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { SortPreference } from '@shared/types/sort.types'

import { InventoryListWithSort } from './InventoryListWithSort'

const items = [
  { id: 'alpha', title: 'Alpha' },
  { id: 'beta', title: 'Beta' },
]

const sortFieldOptions = [
  { field: 'title', label: 'Title' },
  { field: 'updated', label: 'Updated' },
] as const

const renderInventoryListWithSort = ({
  onSortChange = vi.fn(),
  showSort = true,
}: {
  onSortChange?: (sort: SortPreference) => void
  showSort?: boolean
} = {}) => {
  render(
    <InventoryListWithSort
      getItemKey={(item) => item.id}
      items={items}
      renderItem={(item) => <span>{item.title}</span>}
      showSort={showSort}
      sort={{ direction: 'asc', field: 'title' }}
      sortAriaLabel="Sort items"
      sortFieldOptions={sortFieldOptions}
      title="Items"
      onSortChange={onSortChange}
    />,
  )
}

describe('InventoryListWithSort', () => {
  it('renders SortMenu in the list action slot', () => {
    renderInventoryListWithSort()

    expect(screen.getByRole('heading', { name: 'Items' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sort items' })).toHaveTextContent('Sort')
  })

  it('emits merged sort changes for fields and directions', async () => {
    const user = userEvent.setup()
    const onSortChange = vi.fn()

    renderInventoryListWithSort({ onSortChange })

    await user.click(screen.getByRole('button', { name: 'Sort items' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Updated' }))

    expect(onSortChange).toHaveBeenCalledWith({ direction: 'asc', field: 'updated' })

    await user.click(screen.getByRole('button', { name: 'Sort items' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Desc' }))

    expect(onSortChange).toHaveBeenCalledWith({ direction: 'desc', field: 'title' })
  })

  it('can hide SortMenu while preserving the list', () => {
    renderInventoryListWithSort({ showSort: false })

    const heading = screen.getByRole('heading', { name: 'Items' })

    expect(heading).toBeInTheDocument()
    expect(heading.parentElement).toHaveClass('min-h-6')
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Sort items' })).not.toBeInTheDocument()
  })

  it('renders nothing for an empty list', () => {
    const { container } = render(
      <InventoryListWithSort
        getItemKey={(item) => item.id}
        items={[] as typeof items}
        renderItem={(item) => <span>{item.title}</span>}
        sort={{ direction: 'asc', field: 'title' }}
        sortAriaLabel="Sort items"
        sortFieldOptions={sortFieldOptions}
        title="Items"
        onSortChange={vi.fn()}
      />,
    )

    expect(container).toBeEmptyDOMElement()
  })
})
