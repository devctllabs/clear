import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ActionMenu } from './ActionMenu'

describe('ActionMenu', () => {
  it('keeps focused triggers opaque on their surface', () => {
    const items = [{ label: 'Edit', onSelect: vi.fn() }]

    render(
      <>
        <ActionMenu ariaLabel="Page actions" items={items} />
        <ActionMenu
          ariaLabel="Card actions"
          items={items}
          triggerFocusSurface="card"
        />
      </>,
    )

    expect(screen.getByRole('button', { name: 'Page actions' })).toHaveClass(
      'size-11',
      'focus-visible:bg-background',
      'focus-visible:hover:bg-background',
    )
    expect(screen.getByRole('button', { name: 'Card actions' })).toHaveClass(
      'card-focus-ring',
      'focus-visible:bg-card',
      'focus-visible:hover:bg-card',
    )
  })

  it('uses quiet rounded focus styles for menu items', async () => {
    const user = userEvent.setup()
    const items = [{ label: 'Edit', onSelect: vi.fn() }]

    render(<ActionMenu ariaLabel="Page actions" items={items} />)

    await user.click(screen.getByRole('button', { name: 'Page actions' }))

    expect(await screen.findByRole('menuitem', { name: 'Edit' })).toHaveClass(
      'rounded-[1rem]',
      'focus-visible:outline-none',
      'data-[highlighted]:outline-none',
      'data-[highlighted]:bg-primary/10',
    )
  })
})
