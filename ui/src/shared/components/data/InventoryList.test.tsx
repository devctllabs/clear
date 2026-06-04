import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  InventoryList,
  InventorySection,
  InventoryRowShell,
  inventoryRowOverlayClassName,
} from './InventoryList'

const items = [
  { id: 'alpha', title: 'Alpha' },
  { id: 'beta', title: 'Beta' },
]

describe('InventoryList', () => {
  it('renders nothing for an empty list by default', () => {
    const { container } = render(
      <InventoryList
        getItemKey={(item) => item.id}
        items={[] as typeof items}
        renderItem={(item) => <span>{item.title}</span>}
      />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('renders a list surface, rows, and dividers', () => {
    render(
      <InventoryList
        getItemKey={(item) => item.id}
        items={items}
        renderItem={(item) => (
          <InventoryRowShell data-testid={`row-${item.id}`}>
            <a
              aria-label={`Open ${item.title}`}
              className={inventoryRowOverlayClassName}
              href={`/items/${item.id}`}
            />
            <span className="pointer-events-none relative z-20 min-w-0">
              {item.title}
            </span>
          </InventoryRowShell>
        )}
      />,
    )

    const surface = screen.getByRole('link', { name: 'Open Alpha' }).closest('.overflow-hidden')

    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open Alpha' })).toHaveClass(
      'focus-visible:ring-inset',
      'focus-visible:ring-offset-0',
    )
    expect(screen.getByTestId('row-alpha')).toHaveClass(
      'relative',
      'isolate',
      'grid',
      'hover:bg-accent/80',
    )
    expect(surface).toHaveClass('rounded-compact', 'overflow-hidden')
    expect(surface?.querySelectorAll('.border-t')).toHaveLength(1)
  })

  it('renders an inventory section heading, action slot, and children', () => {
    render(
      <InventorySection
        actionSlot={<button type="button">Section action</button>}
        title="Section title"
      >
        <p>Section content</p>
      </InventorySection>,
    )

    const section = screen.getByRole('heading', { name: 'Section title' }).closest('section')
    const header = screen.getByRole('heading', { name: 'Section title' }).parentElement

    expect(section).toHaveClass('space-y-3')
    expect(header).toHaveClass('min-h-6')
    expect(screen.getByRole('button', { name: 'Section action' })).toBeInTheDocument()
    expect(screen.getByText('Section content')).toBeInTheDocument()
  })
})
