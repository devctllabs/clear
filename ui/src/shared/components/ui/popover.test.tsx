import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './popover'

describe('Popover', () => {
  it('renders anchored dialog content without document scroll lock', async () => {
    const user = userEvent.setup()

    render(
      <Popover>
        <PopoverTrigger>Open picker</PopoverTrigger>
        <PopoverContent aria-label="Icon picker" role="dialog">
          Pick an icon
        </PopoverContent>
      </Popover>,
    )

    await user.click(screen.getByRole('button', { name: 'Open picker' }))
    const dialog = await screen.findByRole('dialog', { name: 'Icon picker' })

    expect(dialog).toHaveTextContent('Pick an icon')
    expect(dialog).toHaveClass('bg-popover', 'shadow-floating')
    expect(document.body.style.overflow).toBe('')
    expect(document.body.style.paddingRight).toBe('')
    expect(document.body.style.pointerEvents).toBe('')
  })

  it('does not restore focus to the trigger after pointer close', async () => {
    render(
      <Popover>
        <PopoverTrigger>Open picker</PopoverTrigger>
        <PopoverContent aria-label="Icon picker" role="dialog">
          Pick an icon
        </PopoverContent>
      </Popover>,
    )

    const trigger = screen.getByRole('button', { name: 'Open picker' })
    fireEvent.pointerDown(trigger)
    fireEvent.click(trigger)
    expect(await screen.findByRole('dialog', { name: 'Icon picker' })).toBeInTheDocument()

    fireEvent.pointerDown(trigger)
    fireEvent.click(trigger)
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Icon picker' })).not.toBeInTheDocument()
    })
    await waitFor(() => {
      expect(trigger).not.toHaveFocus()
    })
  })

  it('restores focus to the trigger after keyboard close', async () => {
    const user = userEvent.setup()

    render(
      <Popover>
        <PopoverTrigger>Open picker</PopoverTrigger>
        <PopoverContent aria-label="Icon picker" role="dialog">
          Pick an icon
        </PopoverContent>
      </Popover>,
    )

    const trigger = screen.getByRole('button', { name: 'Open picker' })
    trigger.focus()
    await user.keyboard('{Enter}')
    expect(await screen.findByRole('dialog', { name: 'Icon picker' })).toBeInTheDocument()

    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Icon picker' })).not.toBeInTheDocument()
    })
    expect(trigger).toHaveFocus()
  })
})
