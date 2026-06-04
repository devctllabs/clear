import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ResourceCreateMenu } from './ResourceCreateMenu'

describe('ResourceCreateMenu', () => {
  it('does not leave the create trigger focused after pointer close', async () => {
    render(<ResourceCreateMenu onCreateDeck={vi.fn()} onCreateFolder={vi.fn()} />)

    const trigger = screen.getByRole('button', { name: 'Create' })
    fireEvent.pointerDown(trigger)
    fireEvent.click(trigger)
    expect(await screen.findByRole('menu')).toBeInTheDocument()

    fireEvent.pointerDown(trigger)
    fireEvent.click(trigger)
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })
    await waitFor(() => {
      expect(trigger).not.toHaveFocus()
    })
  })

  it('keeps keyboard focus restoration when closing with Escape', async () => {
    const user = userEvent.setup()

    render(<ResourceCreateMenu onCreateDeck={vi.fn()} onCreateFolder={vi.fn()} />)

    const trigger = screen.getByRole('button', { name: 'Create' })
    trigger.focus()
    await user.keyboard('{Enter}')
    expect(await screen.findByRole('menu')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })
    expect(trigger).toHaveFocus()
  })

  it('supports the responsive header trigger shape', () => {
    render(
      <ResourceCreateMenu
        variant="responsive"
        onCreateDeck={vi.fn()}
        onCreateFolder={vi.fn()}
      />,
    )

    const trigger = screen.getByRole('button', { name: 'Create' })

    expect(trigger).toHaveClass('h-11', 'min-w-11', 'px-0')
    expect(trigger.textContent).toBe('')
  })
})
