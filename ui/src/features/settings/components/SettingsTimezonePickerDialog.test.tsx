import type { ReactElement } from 'react'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { AppRuntimeProfileProvider } from '@shared/hooks/useAppLayoutMode'
import type { RuntimeFormFactor } from '@shared/lib/runtime-profile'

import { SettingsTimezonePickerDialog } from './SettingsTimezonePickerDialog'

const renderTimezoneDialog = (
  element: ReactElement,
  formFactor: RuntimeFormFactor = 'desktop',
) =>
  render(
    <AppRuntimeProfileProvider initialProfile={{ formFactor, runtime: 'web' }}>
      {element}
    </AppRuntimeProfileProvider>,
  )

const waitForMicrotask = () =>
  new Promise<void>((resolve) => {
    queueMicrotask(resolve)
  })

describe('SettingsTimezonePickerDialog', () => {
  it('searches and selects a timezone', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const onSelect = vi.fn()

    renderTimezoneDialog(
      <SettingsTimezonePickerDialog
        open
        value="auto"
        onOpenChange={onOpenChange}
        onSelect={onSelect}
      />,
    )

    const dialog = screen.getByRole('dialog', { name: 'Choose Timezone' })
    expect(dialog).toHaveClass(
      'flex',
      'h-[min(34rem,calc(100dvh-2rem))]',
      'flex-col',
    )
    const searchInput = within(dialog).getByLabelText('Search timezones')
    await waitFor(() => {
      expect(searchInput).toHaveFocus()
    })
    expect(searchInput).not.toHaveClass('focus-visible:ring-2')
    expect(searchInput).toHaveClass('keyboard-card-input-focus')

    const optionList = searchInput.closest('label')?.nextElementSibling
    expect(optionList).toHaveClass(
      '-mx-1',
      'min-h-0',
      'flex-1',
      'overflow-y-auto',
      'quiet-scrollbar',
      'px-1',
      'py-1',
    )

    expect(within(dialog).getByRole('button', { name: /Automatic/ })).toHaveClass(
      'card-focus-ring',
      'bg-card',
      'focus-visible:bg-card',
      'focus-visible:hover:bg-card',
    )

    const activeBadge = within(dialog).getByText('Active')
    expect(activeBadge).toHaveClass('text-[12px]', 'font-semibold', 'leading-5')
    expect(activeBadge).not.toHaveClass('uppercase', 'type-label')

    fireEvent.change(searchInput, {
      target: { value: 'tokyo' },
    })
    await user.click(await within(dialog).findByRole('button', { name: /Tokyo/ }))

    expect(onSelect).toHaveBeenCalledWith('Asia/Tokyo')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('does not autofocus search on mobile layout', async () => {
    renderTimezoneDialog(
      <SettingsTimezonePickerDialog
        open
        value="auto"
        onOpenChange={vi.fn()}
        onSelect={vi.fn()}
      />,
      'mobile',
    )

    const dialog = screen.getByRole('dialog', { name: 'Choose Timezone' })
    const searchInput = within(dialog).getByLabelText('Search timezones')

    await waitForMicrotask()

    expect(searchInput).not.toHaveFocus()
  })

  it('renders empty search results and closes from overlay', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    renderTimezoneDialog(
      <SettingsTimezonePickerDialog
        open
        value="auto"
        onOpenChange={onOpenChange}
        onSelect={vi.fn()}
      />,
    )

    const dialog = screen.getByRole('dialog', { name: 'Choose Timezone' })
    fireEvent.change(within(dialog).getByLabelText('Search timezones'), {
      target: { value: 'no-city-match' },
    })
    expect(await within(dialog).findByText('No matching timezones.')).toBeInTheDocument()
    expect(within(dialog).getByTestId('timezone-picker-results')).toHaveClass(
      'min-h-0',
      'flex-1',
      'overflow-y-auto',
      'quiet-scrollbar',
    )
    expect(within(dialog).getByText('No matching timezones.')).toHaveClass(
      'min-h-full',
      'items-center',
      'justify-center',
    )

    const overlay = document.querySelector('[data-slot="dialog-overlay"]')
    expect(overlay).toBeInTheDocument()
    expect(overlay).toHaveClass('bg-overlay')
    expect(overlay).not.toHaveClass(`bg-${'black'}/50`)
    expect(overlay).not.toHaveClass(`bg-${'black'}/80`)
    await user.click(overlay as HTMLElement)
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })
})
