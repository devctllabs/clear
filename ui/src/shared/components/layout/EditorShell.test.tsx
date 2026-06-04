import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { StorybookRouterProvider } from '@/test/storybook/router'
import { mockMatchMedia } from '@/test/matchMedia'
import { domainError } from '@shared/errors'

import { EditorShell } from './EditorShell'

describe('EditorShell', () => {
  afterEach(() => {
    vi.useRealTimers()
    mockMatchMedia(false)
  })

  it('renders editor chrome and delegates submit action', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(
      <StorybookRouterProvider>
        <EditorShell
          actionLabel="Save changes"
          backTo="/dashboard/independent-study"
          title="Edit Deck"
          onSubmit={onSubmit}
        >
          <p>Editor fields</p>
        </EditorShell>
      </StorybookRouterProvider>,
    )

    expect(screen.getByRole('heading', { name: 'Edit Deck' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Close editor' })).toHaveAttribute(
      'href',
      '/dashboard/independent-study',
    )
    expect(screen.getByText('Editor fields')).toBeInTheDocument()
    expect(document.querySelector('footer')).toHaveClass(
      'bottom-[var(--visual-viewport-bottom-offset,0px)]',
      'pb-[calc(1.5rem+env(safe-area-inset-bottom))]',
    )

    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('renders compact action errors below the submit button', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(
      <StorybookRouterProvider>
        <EditorShell
          actionLabel="Save changes"
          actionError={{
            error: domainError.unavailable('Deck could not be saved.'),
            title: 'Could not save deck',
          }}
          backTo="/dashboard/independent-study"
          title="Edit Deck"
          onSubmit={onSubmit}
        >
          <p>Editor fields</p>
        </EditorShell>
      </StorybookRouterProvider>,
    )

    const button = screen.getByRole('button', { name: 'Save changes' })
    const alert = screen.getByRole('alert')

    expect(button.querySelector('svg')).toBeInTheDocument()
    expect(button).toHaveAccessibleDescription(
      'Could not save deck. The service is temporarily unavailable.',
    )
    expect(alert).toHaveTextContent('Could not save deck')
    expect(alert).toHaveTextContent('The service is temporarily unavailable.')

    await user.click(button)
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('disables submit while pending and keeps the action label stable', async () => {
    vi.useFakeTimers()
    const onSubmit = vi.fn()

    render(
      <StorybookRouterProvider>
        <EditorShell
          actionLabel="Save changes"
          backTo="/dashboard/independent-study"
          isSubmitting
          title="Edit Deck"
          onSubmit={onSubmit}
        >
          <p>Editor fields</p>
        </EditorShell>
      </StorybookRouterProvider>,
    )

    const button = screen.getByRole('button', { name: 'Save changes' })

    expect(button).toBeDisabled()
    expect(button).toHaveAccessibleName('Save changes')
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button.querySelector('[data-slot="pending-spinner"]')).not.toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(250)
    })

    expect(button).toHaveAccessibleName('Save changes')
    expect(button.querySelector('[data-slot="pending-spinner"]')).toBeInTheDocument()

    fireEvent.click(button)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('renders the submit action in the desktop header', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    mockMatchMedia(true)

    render(
      <StorybookRouterProvider>
        <EditorShell
          actionLabel="Save changes"
          backTo="/dashboard/independent-study"
          title="Edit Deck"
          onSubmit={onSubmit}
        >
          <p>Editor fields</p>
        </EditorShell>
      </StorybookRouterProvider>,
    )

    const heading = screen.getByRole('heading', { name: 'Edit Deck' })
    const closeEditor = screen.getByRole('link', { name: 'Close editor' })
    const button = screen.getByRole('button', { name: 'Save changes' })

    expect(heading.closest('div.mx-auto')).toHaveClass('max-w-editor')
    expect(closeEditor).toHaveClass(
      'text-foreground/70',
      'hover:bg-muted',
      'focus-visible:bg-background',
      'focus-visible:hover:bg-background',
    )
    expect(closeEditor).not.toHaveClass('bg-card', 'ring-border')
    expect(button).toHaveClass('h-12')
    expect(document.querySelector('footer')).not.toBeInTheDocument()

    await user.click(button)
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })
})
