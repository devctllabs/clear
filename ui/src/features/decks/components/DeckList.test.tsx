import { render, screen } from '@testing-library/react'
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { describe, expect, it, vi } from 'vitest'

import { AppProviders } from '@core/providers/AppProviders'
import { createAppServices } from '@core/services'
import type { SortPreference } from '@shared/types/sort.types'

import type { Deck } from '../types/deck.types'
import { DeckList } from './DeckList'

const sort: SortPreference = {
  direction: 'asc',
  field: 'title',
}

const createDeck = (deck: Partial<Deck> = {}): Deck => ({
  description: '',
  dueToday: 0,
  icon: 'book-open',
  id: 'deck',
  parentId: 'independent-study',
  progress: 0,
  title: 'Deck',
  totalNotes: 0,
  updatedAt: '2026-04-24T12:00:00.000Z',
  workspaceId: 'independent-study',
  ...deck,
})

const renderDeckList = (decks: Deck[]) => {
  const rootRoute = createRootRoute({ component: Outlet })
  const listRoute = createRoute({
    component: () => (
      <DeckList
        decks={decks}
        sort={sort}
        onDelete={vi.fn()}
        onSortChange={vi.fn()}
      />
    ),
    getParentRoute: () => rootRoute,
    path: '/',
  })
  const router = createRouter({
    history: createMemoryHistory({ initialEntries: ['/'] }),
    routeTree: rootRoute.addChildren([listRoute]),
  })

  render(
    <AppProviders services={createAppServices('mock')}>
      <RouterProvider router={router} />
    </AppProviders>,
  )
}

describe('DeckList', () => {
  it('hides deck sorting for a single deck', async () => {
    renderDeckList([createDeck({ id: 'single-deck', title: 'Single Deck' })])

    expect(await screen.findByRole('heading', { name: 'Decks' })).toBeInTheDocument()
    expect(screen.getByText('Single Deck')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Sort decks' })).not.toBeInTheDocument()
    const deckSection = screen.getByRole('heading', { name: 'Decks' }).closest('section')
    const listSurface = deckSection?.querySelector('.overflow-hidden')

    expect(listSurface).toHaveClass('rounded-compact')
    expect(deckSection?.querySelector('[class*="grid-cols-[repeat"]')).toBeNull()
  })

  it('shows deck sorting for multiple decks', async () => {
    renderDeckList([
      createDeck({ id: 'first-deck', title: 'First Deck' }),
      createDeck({ id: 'second-deck', title: 'Second Deck' }),
    ])

    expect(await screen.findByRole('button', { name: 'Sort decks' })).toBeInTheDocument()
  })
})
