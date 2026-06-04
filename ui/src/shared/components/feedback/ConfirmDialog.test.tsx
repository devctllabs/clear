import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ConfirmDialog } from './ConfirmDialog'

describe('ConfirmDialog', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not render when closed', () => {
    render(
      <ConfirmDialog
        confirmLabel="Delete"
        description="Remove item"
        open={false}
        title="Delete item?"
        onConfirm={() => undefined}
        onOpenChange={() => undefined}
      />,
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('handles cancel, confirm, escape, and overlay dismiss without closing on confirm', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onOpenChange = vi.fn()
    const { rerender } = render(
      <ConfirmDialog
        confirmLabel="Delete"
        description="Remove item"
        open
        title="Delete item?"
        onConfirm={onConfirm}
        onOpenChange={onOpenChange}
      />,
    )

    const dialog = screen.getByRole('dialog', { name: 'Delete item?' })
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    expect(onOpenChange).toHaveBeenLastCalledWith(false)

    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onOpenChange).toHaveBeenCalledTimes(1)

    await user.keyboard('{Escape}')
    expect(onOpenChange).toHaveBeenLastCalledWith(false)

    const overlay = document.querySelector('[data-slot="dialog-overlay"]')
    expect(overlay).toBeInTheDocument()
    expect(overlay).toHaveClass('bg-overlay')
    expect(overlay).not.toHaveClass(`bg-${'black'}/50`)
    expect(overlay).not.toHaveClass(`bg-${'black'}/80`)
    await user.click(overlay as HTMLElement)
    expect(onOpenChange).toHaveBeenLastCalledWith(false)

    rerender(
      <ConfirmDialog
        confirmLabel="Delete"
        description="Remove item"
        open={false}
        title="Delete item?"
        onConfirm={onConfirm}
        onOpenChange={onOpenChange}
      />,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('traps focus while open and restores focus after close', async () => {
    const user = userEvent.setup()

    const Harness = () => {
      const [open, setOpen] = useState(false)

      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open delete dialog
          </button>
          <ConfirmDialog
            confirmLabel="Delete"
            description="Remove item"
            open={open}
            title="Delete item?"
            onConfirm={() => undefined}
            onOpenChange={setOpen}
          />
        </>
      )
    }

    render(<Harness />)

    const trigger = screen.getByRole('button', { name: 'Open delete dialog' })
    await user.click(trigger)

    const dialog = screen.getByRole('dialog', { name: 'Delete item?' })
    const cancelButton = within(dialog).getByRole('button', { name: 'Cancel' })
    const confirmButton = within(dialog).getByRole('button', { name: 'Delete' })

    expect(cancelButton).toHaveFocus()

    await user.tab()
    expect(confirmButton).toHaveFocus()

    await user.tab()
    expect(cancelButton).toHaveFocus()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog', { name: 'Delete item?' })).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('disables confirm while confirming and keeps the visible label stable', async () => {
    vi.useFakeTimers()
    const onConfirm = vi.fn()

    render(
      <ConfirmDialog
        confirmLabel="Delete"
        confirming
        description="Remove item"
        open
        title="Delete item?"
        onConfirm={onConfirm}
        onOpenChange={() => undefined}
      />,
    )

    const confirmButton = screen.getByRole('button', { name: 'Delete' })
    expect(confirmButton).toBeDisabled()
    expect(confirmButton).toHaveAccessibleName('Delete')
    expect(confirmButton).toHaveAttribute('aria-busy', 'true')
    expect(confirmButton.querySelector('[data-slot="pending-spinner"]')).not.toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(250)
    })

    expect(confirmButton).toHaveAccessibleName('Delete')
    expect(confirmButton.querySelector('[data-slot="pending-spinner"]')).toBeInTheDocument()

    fireEvent.click(confirmButton)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('renders an action error inside the dialog and keeps retry enabled', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()

    render(
      <ConfirmDialog
        actionError={{
          error: new Error('Archive write failed.'),
          title: 'Could not delete item',
        }}
        confirmLabel="Delete workspace"
        description="Remove item"
        open
        title="Delete item?"
        onConfirm={onConfirm}
        onOpenChange={() => undefined}
      />,
    )

    const dialog = screen.getByRole('dialog', { name: 'Delete item?' })
    const alert = within(dialog).getByRole('alert')
    expect(alert).toHaveTextContent('Could not delete item')
    expect(alert).toHaveTextContent('Archive write failed.')
    expect(alert).toHaveClass('text-destructive')
    expect(alert).not.toHaveClass('bg-destructive/10')
    expect(alert).not.toHaveClass('border-destructive/20')

    const confirmButton = within(dialog).getByRole('button', { name: 'Delete workspace' })
    const confirmLabel = within(confirmButton).getByText('Delete workspace')
    const cancelButton = within(dialog).getByRole('button', { name: 'Cancel' })
    const actionRow = confirmButton.parentElement

    expect(actionRow).toHaveClass('flex-col-reverse', 'min-[390px]:flex-row')
    expect(cancelButton).toHaveClass('min-[390px]:w-28')
    expect(confirmButton).toHaveClass('min-w-0', 'flex-1')
    expect(confirmButton).not.toHaveClass('h-11')
    expect(confirmLabel).toHaveClass('min-w-0', 'whitespace-normal', 'text-center')

    await user.click(confirmButton)
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })
})
