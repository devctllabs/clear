import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

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
})
