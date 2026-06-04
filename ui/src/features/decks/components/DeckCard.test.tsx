import { render, screen } from '@testing-library/react'
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { AppProviders } from '@core/providers/AppProviders'
import { createAppServices, type AppServices } from '@core/services'
import type { ReviewCard } from '@features/review'
import type { Workspace } from '@features/workspaces'
import { domainError, err, ok } from '@shared/errors'
import { consumeReviewReturnTarget } from '@shared/lib/navigation-state'
import { renderRoute } from '@/test/renderRoute'

import type { Deck } from '../types/deck.types'
import { ConnectedDeckCard, DeckCard } from './DeckCard'

const baseDeck: Deck = {
  description: '',
  dueToday: 18,
  icon: 'brain',
  id: 'test-deck',
  parentId: 'independent-study',
  progress: 72,
  title: 'Biology',
  totalNotes: 145,
  updatedAt: '2026-04-24T12:00:00.000Z',
  workspaceId: 'independent-study',
}

const routeWorkspace: Workspace = {
  description: 'Reading notes, review decks, and reference material for ongoing study.',
  icon: 'sparkles',
  id: 'independent-study',
  title: 'Independent Study',
  updatedAt: '2026-04-24T12:00:00.000Z',
}

const routeDeck: Deck = {
  ...baseDeck,
  dueToday: 18,
  id: 'cognitive-biases',
  progress: 72,
  title: 'Cognitive Biases',
  totalNotes: 145,
}

const routeReviewCard: ReviewCard = {
  back: 'A short interval when political conditions make change unusually likely.',
  front: 'Policy Window',
  id: 'anchoring:basic',
  kind: 'basic',
  progress: 44,
}

const createDeckRouteServices = (): AppServices => {
  const services = createAppServices('mock')

  return {
    ...services,
    decks: {
      ...services.decks,
      async getById(deckId) {
        return deckId === routeDeck.id
          ? ok(routeDeck)
          : err(domainError.notFound('Deck not found.', 'deck', deckId))
      },
      async listWorkspaceRoot(workspaceId) {
        return ok(
          workspaceId === routeWorkspace.id ? [routeDeck] : [],
        )
      },
    },
    folders: {
      ...services.folders,
      async listWorkspaceRoot() {
        return ok([])
      },
    },
    notes: {
      ...services.notes,
      async listByDeck() {
        return ok([])
      },
    },
    review: {
      ...services.review,
      async start(deckId) {
        return ok(
          deckId === routeDeck.id
            ? {
                currentCard: routeReviewCard,
                deckId: routeDeck.id,
                durationSeconds: 0,
                id: 'cognitive-biases-review',
                mode: 'due',
                plannedCount: 1,
                reviewedCount: 0,
                startedAt: '2026-05-16T12:00:00.000Z',
                status: 'active',
              }
            : { mode: 'unavailable', reason: 'empty-deck' },
        )
      },
      async get() {
        return ok({
          currentCard: routeReviewCard,
          deckId: routeDeck.id,
          durationSeconds: 0,
          id: 'cognitive-biases-review',
          mode: 'due',
          plannedCount: 1,
          reviewedCount: 0,
          startedAt: '2026-05-16T12:00:00.000Z',
          status: 'active',
        })
      },
    },
    workspaces: {
      ...services.workspaces,
      async getActiveId() {
        return ok(routeWorkspace.id)
      },
      async getById(workspaceId) {
        return workspaceId === routeWorkspace.id
          ? ok(routeWorkspace)
          : err(domainError.notFound('Workspace not found.', 'workspace', workspaceId))
      },
      async setActiveId() {
        return ok(undefined)
      },
    },
  }
}

const renderDeckRoute = () =>
  renderRoute('/dashboard/independent-study', { services: createDeckRouteServices() })

describe('DeckCard', () => {
  it('delegates pure card actions through callbacks', async () => {
    const user = userEvent.setup()
    const deck: Deck = {
      ...baseDeck,
      dueToday: 0,
      id: 'empty-due',
      progress: 0,
      title: 'Empty Due',
      totalNotes: 0,
    }
    const onDelete = vi.fn()
    const onEdit = vi.fn()
    const onOpen = vi.fn()
    const onReview = vi.fn()

    render(
      <DeckCard
        deck={deck}
        onDelete={onDelete}
        onEdit={onEdit}
        onOpen={onOpen}
        onReview={onReview}
      />,
    )

    const card = screen.getByRole('button', { name: 'Open Empty Due deck' })
    expect(screen.getByRole('button', { name: 'Review' })).toHaveClass('bg-card')

    card.focus()
    await user.keyboard('{Enter}')
    expect(onOpen).toHaveBeenCalledWith(deck)

    await user.click(screen.getByRole('button', { name: 'Review' }))
    expect(onReview).toHaveBeenCalledWith(deck)
    expect(onOpen).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Empty Due actions' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Edit' }))
    expect(onEdit).toHaveBeenCalledWith(deck)
    expect(onOpen).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Empty Due actions' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }))
    expect(onDelete).toHaveBeenCalledWith(deck)
    expect(onOpen).toHaveBeenCalledTimes(1)
  })

  it('derives the review button tone from due today', () => {
    const callbacks = {
      onDelete: vi.fn(),
      onEdit: vi.fn(),
      onOpen: vi.fn(),
      onReview: vi.fn(),
    }

    const { rerender } = render(
      <DeckCard deck={{ ...baseDeck, dueToday: 0, id: 'zero-due' }} {...callbacks} />,
    )

    expect(screen.getByRole('button', { name: 'Review' })).toHaveClass('bg-card')

    rerender(<DeckCard deck={{ ...baseDeck, dueToday: 7, id: 'has-due' }} {...callbacks} />)

    expect(screen.getByRole('button', { name: 'Review' })).toHaveClass('bg-primary')
  })

  it('normalizes invalid deck metrics before rendering actions and progress', () => {
    const callbacks = {
      onDelete: vi.fn(),
      onEdit: vi.fn(),
      onOpen: vi.fn(),
      onReview: vi.fn(),
    }

    render(
      <DeckCard
        deck={{ ...baseDeck, dueToday: -3, id: 'invalid-metrics', progress: Number.NaN }}
        {...callbacks}
      />,
    )

    expect(screen.getByRole('button', { name: 'Review' })).toHaveClass('bg-card')
    expect(screen.getByText('0%')).toBeInTheDocument()
    expect(screen.getByText('Due Today').nextElementSibling).toHaveTextContent('0')
    expect(screen.queryByText('-3')).not.toBeInTheDocument()
    expect(screen.queryByText(/NaN|Infinity/)).not.toBeInTheDocument()
  })

  it('keeps row-surface deck actions and review controls available', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    const onEdit = vi.fn()
    const onOpen = vi.fn()
    const onReview = vi.fn()

    render(
      <DeckCard
        deck={baseDeck}
        surface="row"
        onDelete={onDelete}
        onEdit={onEdit}
        onOpen={onOpen}
        onReview={onReview}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Open Biology deck' }))
    expect(onOpen).toHaveBeenCalledWith(baseDeck)
    const dueMetadata = screen.getByText('Due').closest('div')
    expect(dueMetadata).toHaveClass('flex-col')
    expect(dueMetadata).not.toHaveClass('rounded-full')
    expect(dueMetadata).not.toHaveClass('bg-muted')
    expect(screen.getByText('18')).toHaveClass('text-xs')
    const actionsButton = screen.getByRole('button', { name: 'Biology actions' })
    expect(actionsButton.parentElement).toHaveClass(
      'col-start-3',
      'row-start-1',
      'sm:col-start-4',
      'sm:-translate-y-2',
      'sm:self-start',
    )
    const reviewButton = screen.getByRole('button', { name: 'Review' })
    expect(reviewButton.parentElement).toHaveClass(
      'col-start-2',
      'col-end-4',
      'gap-2',
      'min-[380px]:gap-x-4',
      'row-start-2',
      'sm:col-end-5',
    )
    expect(reviewButton).toHaveClass(
      'min-[380px]:ml-auto',
      'min-[380px]:h-10',
      'min-[380px]:px-5',
      'shrink-0',
    )

    await user.click(reviewButton)
    expect(onReview).toHaveBeenCalledWith(baseDeck)
    expect(reviewButton).toHaveClass('bg-primary')

    await user.click(actionsButton)
    await user.click(await screen.findByRole('menuitem', { name: 'Edit' }))
    expect(onEdit).toHaveBeenCalledWith(baseDeck)

    await user.click(actionsButton)
    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }))
    expect(onDelete).toHaveBeenCalledWith(baseDeck)
  })

  it('opens deck details from keyboard interaction', async () => {
    const user = userEvent.setup()
    renderDeckRoute()

    const card = await screen.findByRole('button', { name: 'Open Cognitive Biases deck' })
    card.focus()
    await user.keyboard('{Enter}')

    expect(await screen.findByRole('heading', { name: 'Cognitive Biases' })).toBeInTheDocument()
    expect(await screen.findByPlaceholderText('Search notes…')).toBeInTheDocument()
  })

  it('opens edit flow from deck actions', async () => {
    const user = userEvent.setup()
    renderDeckRoute()

    await user.click(await screen.findByRole('button', { name: 'Cognitive Biases actions' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Edit' }))

    expect(await screen.findByRole('heading', { name: 'Edit Deck' })).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'Close editor' })).toHaveAttribute(
      'href',
      '/dashboard/independent-study',
    )
  })

  it('opens review from the card review button', async () => {
    const user = userEvent.setup()
    const { router } = renderDeckRoute()

    await screen.findByRole('button', { name: 'Open Cognitive Biases deck' })
    await user.click(screen.getByRole('button', { name: 'Review' }))

    expect(await screen.findByRole('heading', { name: 'Review' })).toBeInTheDocument()
    expect(await screen.findByText('Policy Window')).toBeInTheDocument()
    expect(screen.queryByText('Policy Window Theory')).not.toBeInTheDocument()
    expect((router.state.location.state as { openedFrom?: unknown }).openedFrom).toBeUndefined()
    expect(consumeReviewReturnTarget(routeWorkspace.id, routeDeck.id)).toBe(
      '/dashboard/independent-study',
    )
  })

  it('handles connected zero-due cards, edit without origin, and review navigation', async () => {
    const user = userEvent.setup()
    const zeroDueDeck: Deck = {
      ...baseDeck,
      dueToday: 0,
      icon: 'shapes',
      id: 'empty-due',
      progress: 0,
      title: 'Empty Due',
      totalNotes: 0,
      updatedAt: '2026-04-26T12:00:00.000Z',
    }
    const rootRoute = createRootRoute({ component: Outlet })
    const cardRoute = createRoute({
      component: () => <ConnectedDeckCard deck={zeroDueDeck} onDelete={() => undefined} />,
      getParentRoute: () => rootRoute,
      path: '/',
    })
    const deckRoute = createRoute({
      component: () => <h1>Deck opened</h1>,
      getParentRoute: () => rootRoute,
      path: '/dashboard/$workspaceId/decks/$deckId',
    })
    const editRoute = createRoute({
      component: () => <h1>Edit opened</h1>,
      getParentRoute: () => rootRoute,
      path: '/dashboard/$workspaceId/decks/$deckId/edit',
    })
    const reviewRoute = createRoute({
      component: () => <h1>Review opened</h1>,
      getParentRoute: () => rootRoute,
      path: '/dashboard/$workspaceId/decks/$deckId/review',
    })
    const router = createRouter({
      history: createMemoryHistory({ initialEntries: ['/'] }),
      routeTree: rootRoute.addChildren([cardRoute, deckRoute, editRoute, reviewRoute]),
    })

    render(
      <AppProviders services={createAppServices('mock')}>
        <RouterProvider router={router} />
      </AppProviders>,
    )

    await screen.findByRole('button', { name: 'Open Empty Due deck' })
    expect(screen.getByRole('button', { name: 'Review' })).toHaveClass('bg-card')
    await user.click(screen.getByRole('button', { name: 'Review' }))
    expect(await screen.findByRole('heading', { name: 'Review opened' })).toBeInTheDocument()

    await router.navigate({ to: '/' })
    await screen.findByRole('button', { name: 'Open Empty Due deck' })
    await user.click(screen.getByRole('button', { name: 'Empty Due actions' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Edit' }))
    expect(await screen.findByRole('heading', { name: 'Edit opened' })).toBeInTheDocument()

    await router.navigate({ to: '/' })
    const reopenedCard = await screen.findByRole('button', { name: 'Open Empty Due deck' })
    reopenedCard.focus()
    await user.keyboard('{ }')
    expect(await screen.findByRole('heading', { name: 'Deck opened' })).toBeInTheDocument()
  })
})
