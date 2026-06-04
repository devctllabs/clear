import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { renderRoute } from '@/test/renderRoute'

describe('editor close target flows', () => {
  it('returns from folder-scoped deck creation to the folder that opened it', async () => {
    const user = userEvent.setup()
    renderRoute('/dashboard/independent-study/folders/reading-notes')

    expect(await screen.findByRole('heading', { name: 'Reading Notes' })).toBeInTheDocument()

    await user.click(await screen.findByRole('button', { name: 'Create' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Deck' }))

    expect(await screen.findByRole('heading', { name: 'Create Deck' })).toBeInTheDocument()
    const closeEditor = await screen.findByRole('link', { name: 'Close editor' })
    expect(closeEditor).toHaveAttribute(
      'href',
      '/dashboard/independent-study/folders/reading-notes',
    )

    await user.click(closeEditor)

    expect(await screen.findByRole('heading', { name: 'Reading Notes' })).toBeInTheDocument()
  })

  it('returns from deck-scoped note creation to the deck that opened it', async () => {
    const user = userEvent.setup()
    renderRoute('/dashboard/independent-study/decks/world-history')

    expect(await screen.findByRole('heading', { name: 'World History' })).toBeInTheDocument()

    await user.click(await screen.findByRole('button', { name: 'Create note' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Basic' }))

    expect(await screen.findByRole('heading', { name: 'New Note' })).toBeInTheDocument()
    const closeEditor = await screen.findByRole('link', { name: 'Close editor' })
    expect(closeEditor).toHaveAttribute(
      'href',
      '/dashboard/independent-study/decks/world-history',
    )

    await user.click(closeEditor)

    expect(await screen.findByRole('heading', { name: 'World History' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Notes' })).toBeInTheDocument()
  })
})
