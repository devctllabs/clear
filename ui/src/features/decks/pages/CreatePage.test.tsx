import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { createAppServices } from '@core/services'
import { renderRoute } from '@/test/renderRoute'

describe('DeckCreatePage', () => {
  it('creates a root deck and falls back to the workspace from close', async () => {
    const user = userEvent.setup()
    renderRoute('/dashboard/independent-study/create/deck')

    expect(await screen.findByRole('heading', { name: 'Create Deck' })).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'Close editor' })).toHaveAttribute(
      'href',
      '/dashboard/independent-study',
    )
    expect(await screen.findByText('Workspace')).toBeInTheDocument()

    fireEvent.change(await screen.findByLabelText('Deck name'), {
      target: { value: 'Neuro Draft Deck' },
    })
    fireEvent.change(await screen.findByLabelText('Deck description'), {
      target: { value: 'Cards collected for a new neuro draft.' },
    })
    await user.click(await screen.findByRole('button', { name: 'Create deck' }))

    expect(await screen.findByRole('heading', { name: 'Neuro Draft Deck' })).toBeInTheDocument()
    expect(await screen.findByPlaceholderText('Search notes…')).toBeInTheDocument()
  })

  it('creates a folder deck with the parent folder location', async () => {
    const user = userEvent.setup()
    renderRoute('/dashboard/independent-study/folders/reading-notes/create/deck')

    expect(await screen.findByRole('heading', { name: 'Create Deck' })).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'Close editor' })).toHaveAttribute(
      'href',
      '/dashboard/independent-study/folders/reading-notes',
    )
    expect(await screen.findByText('Reading Notes')).toBeInTheDocument()

    fireEvent.change(await screen.findByLabelText('Deck name'), {
      target: { value: 'Reading Notes Flashcards' },
    })
    await user.click(await screen.findByRole('button', { name: 'Create deck' }))

    expect(await screen.findByRole('heading', { name: 'Reading Notes Flashcards' })).toBeInTheDocument()
  })

  it('validates the deck name before creating', async () => {
    const user = userEvent.setup()
    const baseServices = createAppServices('mock')
    const create = vi.fn(baseServices.decks.create)
    const services = {
      ...baseServices,
      decks: {
        ...baseServices.decks,
        create,
      },
    }

    renderRoute('/dashboard/independent-study/create/deck', { services })

    const name = await screen.findByLabelText('Deck name')
    await user.click(await screen.findByRole('button', { name: 'Create deck' }))

    expect(create).not.toHaveBeenCalled()
    expect(name).toHaveAttribute('aria-invalid', 'true')
    expect(name).toHaveAccessibleDescription('Name is required.')

    fireEvent.change(name, { target: { value: 'Recovered Deck' } })
    expect(name).not.toHaveAttribute('aria-invalid')
    expect(name).not.toHaveAccessibleDescription('Name is required.')
  })
})
