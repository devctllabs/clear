import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './dropdown-menu'

describe('DropdownMenu', () => {
  it('renders menu item variants and nested content', async () => {
    const user = userEvent.setup()

    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel inset>Actions</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem inset>
              Rename
              <DropdownMenuShortcut>Ctrl+R</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuCheckboxItem checked>Enabled</DropdownMenuCheckboxItem>
            <DropdownMenuRadioGroup value="first">
              <DropdownMenuRadioItem value="first">First</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="second">Second</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger inset>More</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Archive</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    )

    await user.click(screen.getByRole('button', { name: 'Open menu' }))

    const menu = await screen.findByRole('menu')
    expect(within(menu).getByText('Actions')).toHaveClass('pl-8')
    expect(within(menu).getByRole('menuitem', { name: 'RenameCtrl+R' })).toHaveClass('pl-8')
    expect(within(menu).getByRole('menuitemcheckbox', { name: 'Enabled' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    expect(within(menu).getByRole('menuitemradio', { name: 'First' })).toHaveAttribute(
      'aria-checked',
      'true',
    )

    await user.hover(within(menu).getByRole('menuitem', { name: 'More' }))
    expect(await screen.findByRole('menuitem', { name: 'Archive' })).toBeInTheDocument()

    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })
  })

  it('does not restore focus to the trigger after pointer close', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Rename</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )

    const trigger = screen.getByRole('button', { name: 'Open menu' })
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

  it('opens without applying document scroll-lock styles by default', async () => {
    const user = userEvent.setup()

    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Rename</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )

    await user.click(screen.getByRole('button', { name: 'Open menu' }))
    expect(await screen.findByRole('menu')).toBeInTheDocument()

    expect(document.body.style.overflow).toBe('')
    expect(document.body.style.paddingRight).toBe('')
    expect(document.body.style.pointerEvents).toBe('')
  })

  it('restores focus to the trigger after keyboard close', async () => {
    const user = userEvent.setup()

    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Rename</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    )

    const trigger = screen.getByRole('button', { name: 'Open menu' })
    trigger.focus()
    await user.keyboard('{Enter}')
    expect(await screen.findByRole('menu')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })
    expect(trigger).toHaveFocus()
  })
})
