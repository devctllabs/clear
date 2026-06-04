import { act, fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { createAppServices } from '@core/services'
import { renderRoute } from '@/test/renderRoute'

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((next) => {
    resolve = next
  })

  return { promise, resolve }
}

describe('DeckEditPage', () => {
  it('renders the editor skeleton while the deck is loading', async () => {
    const baseServices = createAppServices('mock')
    const deckResult = await baseServices.decks.getById('world-history')
    const pendingDeck =
      createDeferred<Awaited<ReturnType<typeof baseServices.decks.getById>>>()
    const services = {
      ...baseServices,
      decks: {
        ...baseServices.decks,
        getById: () => pendingDeck.promise,
      },
    }

    renderRoute('/dashboard/independent-study/decks/world-history/edit', { services })

    expect(await screen.findByRole('status', { name: 'Loading editor' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Edit Deck' })).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'Close editor' })).toHaveAttribute(
      'href',
      '/dashboard/independent-study/decks/world-history',
    )

    await act(async () => {
      pendingDeck.resolve(deckResult)
      await pendingDeck.promise
    })
  })

  it('edits a deck without including the deck in its location path', async () => {
    const user = userEvent.setup()
    renderRoute('/dashboard/independent-study/decks/world-history/edit')

    expect(await screen.findByRole('heading', { name: 'Edit Deck' })).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'Close editor' })).toHaveAttribute(
      'href',
      '/dashboard/independent-study/decks/world-history',
    )
    expect(await screen.findByText('Workspace')).toBeInTheDocument()
    expect(screen.queryByText('Workspace / World History')).not.toBeInTheDocument()

    const title = await screen.findByLabelText('Deck name')
    fireEvent.change(title, { target: { value: 'History Archive' } })
    await user.click(await screen.findByRole('button', { name: 'Save changes' }))

    expect(await screen.findByRole('heading', { name: 'History Archive' })).toBeInTheDocument()
  })
})
