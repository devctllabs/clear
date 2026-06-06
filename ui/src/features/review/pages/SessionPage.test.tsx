import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createAppServices } from '@core/services'
import type {
  DueReviewSession,
  PracticeReviewSession,
  ReviewCard,
  ReviewSession,
  ReviewStartResult,
} from '@features/review'
import { domainError, err, ok } from '@shared/errors'
import {
  consumeReviewReturnTarget,
  saveReviewReturnTarget,
} from '@shared/lib/navigation-state'
import { createBasicReviewCard, createClozeReviewCard } from '@/test/storybook/fixtures'
import { renderRoute } from '@/test/renderRoute'

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((next) => {
    resolve = next
  })

  return { promise, resolve }
}

const createDueReviewServices = (cards: ReviewCard[]) => {
  const baseServices = createAppServices('mock')
  const reviewId = 'world-history-review-due'
  const startedAt = '2026-05-16T12:00:00.000Z'
  let currentIndex = 0
  let reviewedCount = 0

  const buildSession = (): DueReviewSession => {
    if (currentIndex >= cards.length) {
      return {
        completedAt: '2026-05-16T12:03:00.000Z',
        deckId: 'world-history',
        durationSeconds: 180,
        id: reviewId,
        mode: 'due',
        plannedCount: cards.length,
        reviewedCount,
        startedAt,
        status: 'completed',
      }
    }

    return {
      currentCard: cards[currentIndex],
      deckId: 'world-history',
      durationSeconds: reviewedCount * 30,
      id: reviewId,
      mode: 'due',
      plannedCount: cards.length,
      reviewedCount,
      startedAt,
      status: 'active',
    }
  }

  return {
    ...baseServices,
    review: {
      ...baseServices.review,
      async start(deckId: string) {
        return ok<ReviewStartResult>(
          deckId === 'world-history'
            ? buildSession()
            : { mode: 'unavailable', reason: 'empty-deck' },
        )
      },
      async get(requestedReviewId: string) {
        return requestedReviewId === reviewId
          ? ok<ReviewSession>(buildSession())
          : err(domainError.notFound('Review not found.'))
      },
      async grade(requestedReviewId: string, cardId: string) {
        const currentCard = cards[currentIndex]

        if (requestedReviewId !== reviewId || currentCard?.id !== cardId) {
          return err(domainError.notFound('Review card not found.'))
        }

        reviewedCount += 1
        currentIndex += 1

        return ok<ReviewSession>(buildSession())
      },
    },
  }
}

const createSingleCardPracticeReviewServices = (card: ReviewCard) => {
  const baseServices = createAppServices('mock')
  const reviewId = 'world-history-practice-review-single'
  const startedAt = '2026-05-16T12:00:00.000Z'
  let reviewedCount = 0

  const buildSession = (): PracticeReviewSession => ({
    currentCard: card,
    deckId: 'world-history',
    durationSeconds: reviewedCount * 30,
    id: reviewId,
    mode: 'practice',
    reviewedCount,
    startedAt,
  })

  return {
    ...baseServices,
    review: {
      ...baseServices.review,
      async start(deckId: string) {
        return ok<ReviewStartResult>(
          deckId === 'world-history'
            ? buildSession()
            : { mode: 'unavailable', reason: 'empty-deck' },
        )
      },
      async get(requestedReviewId: string) {
        return requestedReviewId === reviewId
          ? ok<ReviewSession>(buildSession())
          : err(domainError.notFound('Review not found.'))
      },
      async grade(requestedReviewId: string, cardId: string) {
        if (requestedReviewId !== reviewId || card.id !== cardId) {
          return err(domainError.notFound('Review card not found.'))
        }

        reviewedCount += 1

        return ok<ReviewSession>(buildSession())
      },
    },
  }
}

describe('ReviewSessionPage', () => {
  afterEach(() => {
    vi.useRealTimers()
    window.sessionStorage.clear()
  })

  it('delays the review skeleton while initial data is loading', async () => {
    vi.useFakeTimers()
    const baseServices = createAppServices('mock')
    const pendingCard =
      createDeferred<Awaited<ReturnType<typeof baseServices.review.start>>>()
    const services = {
      ...baseServices,
      review: {
        ...baseServices.review,
        start: () => pendingCard.promise,
      },
    }

    renderRoute('/dashboard/independent-study/decks/world-history/review', { services })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(screen.queryByRole('status', { name: 'Loading review' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Review' })).not.toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(179)
    })
    expect(screen.queryByRole('status', { name: 'Loading review' })).not.toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })
    expect(screen.getByRole('status', { name: 'Loading review' })).toBeInTheDocument()
  })

  it('renders review without showing the skeleton when initial data resolves quickly', async () => {
    vi.useFakeTimers()
    const baseServices = createAppServices('mock')
    const firstCardResult = await baseServices.review.start('world-history')
    if (!firstCardResult.ok || firstCardResult.value.mode === 'unavailable') {
      throw new Error('Expected a review session')
    }
    const firstSession = firstCardResult.value
    const pendingCard =
      createDeferred<Awaited<ReturnType<typeof baseServices.review.start>>>()
    const services = {
      ...baseServices,
      review: {
        ...baseServices.review,
        start: () => pendingCard.promise,
        get: async () => ok(firstSession),
      },
    }

    renderRoute('/dashboard/independent-study/decks/world-history/review', { services })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(screen.queryByRole('status', { name: 'Loading review' })).not.toBeInTheDocument()

    await act(async () => {
      pendingCard.resolve(firstCardResult)
      await pendingCard.promise
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(screen.getByRole('heading', { name: 'Review' })).toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(180)
    })
    expect(screen.queryByRole('status', { name: 'Loading review' })).not.toBeInTheDocument()
  })

  it('keeps the card visible and shows a delayed spinner on the selected grade', async () => {
    vi.useFakeTimers()
    const baseServices = createAppServices('mock')
    const pendingGrade =
      createDeferred<Awaited<ReturnType<typeof baseServices.review.grade>>>()
    const grade = vi.fn(() => pendingGrade.promise)
    const services = {
      ...baseServices,
      review: {
        ...baseServices.review,
        grade,
      },
    }

    renderRoute('/dashboard/independent-study/decks/world-history/review', { services })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(screen.getByRole('heading', { name: 'Review' })).toBeInTheDocument()
    expect(screen.getByText(/Industrial Revolution/)).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Show answer' }))
    })
    const goodButton = screen.getByRole('button', { name: 'Good' })
    expect(goodButton).not.toBeDisabled()
    await act(async () => {
      fireEvent.click(goodButton)
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(grade).toHaveBeenCalledTimes(1)
    const disabledGoodButton = screen.getByRole('button', { name: 'Good' })
    expect(disabledGoodButton).toBeDisabled()
    fireEvent.click(disabledGoodButton)
    expect(grade).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('status', { name: 'Loading review' })).not.toBeInTheDocument()
    expect(screen.getByText(/Industrial Revolution/)).toBeInTheDocument()
    expect(
      disabledGoodButton.querySelector('[data-slot="pending-spinner"]'),
    ).not.toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(249)
    })
    expect(screen.queryByRole('status', { name: 'Loading review' })).not.toBeInTheDocument()
    expect(screen.getByText(/Industrial Revolution/)).toBeInTheDocument()
    expect(
      disabledGoodButton.querySelector('[data-slot="pending-spinner"]'),
    ).not.toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })
    expect(screen.queryByRole('status', { name: 'Loading review' })).not.toBeInTheDocument()
    expect(screen.getByText(/Industrial Revolution/)).toBeInTheDocument()
    const pendingGoodButton = screen.getByRole('button', { name: 'Good' })
    expect(pendingGoodButton).toHaveAccessibleName('Good')
    expect(pendingGoodButton.querySelector('[data-slot="pending-spinner"]')).toBeInTheDocument()
  })

  it('shows the shared bottom action error when grading fails', async () => {
    const user = userEvent.setup()
    const baseServices = createAppServices('mock')
    const services = {
      ...baseServices,
      review: {
        ...baseServices.review,
        grade: vi.fn(async () => err(domainError.unexpected('Grade failed.'))),
      },
    }

    renderRoute('/dashboard/independent-study/decks/world-history/review', { services })

    await user.click(await screen.findByRole('button', { name: 'Show answer' }))
    await user.click(await screen.findByRole('button', { name: 'Good' }))

    const status = await screen.findByRole('status')
    expect(status).toHaveTextContent('Could not grade card')
    expect(status).toHaveTextContent('Grade failed.')
    expect(status).toHaveClass('rounded-card')
    expect(status).toHaveClass('border-border')
    expect(status).toHaveClass('bg-card')
    expect(status).not.toHaveClass('bg-destructive/10')
    expect(status.parentElement?.parentElement).toHaveClass('bottom-44', 'md:static')
    expect(screen.getByRole('button', { name: 'Dismiss error' })).toBeInTheDocument()
  })

  it('uses bounded progress for due sessions and reviews cloze cards separately', async () => {
    const user = userEvent.setup()
    const services = createDueReviewServices([
      createBasicReviewCard({
        back: 'Corroboration compares independent sources to test reliability.',
        front: 'Which practice checks a source against independent evidence?',
        id: 'source-corroboration:basic',
        progress: 46,
      }),
      createClozeReviewCard({
        body: 'Collective memory preserves {{c1::public narratives}} and {{c2::archives}} across generations.',
        clozeId: 'c1',
        id: 'collective-memory:c1',
        progress: 82,
      }),
      createClozeReviewCard({
        body: 'Collective memory preserves {{c1::public narratives}} and {{c2::archives}} across generations.',
        clozeId: 'c2',
        id: 'collective-memory:c2',
        progress: 38,
      }),
      createBasicReviewCard({
        back: 'Checks and balances limit concentrated authority.',
        front: 'Which principle distributes power across branches?',
        id: 'separation-of-powers:basic',
        progress: 61,
      }),
    ])

    renderRoute('/dashboard/independent-study/decks/world-history/review', { services })

    expect(await screen.findByRole('heading', { name: 'Review' })).toBeInTheDocument()
    expect(
      await screen.findByText('Which practice checks a source against independent evidence?'),
    ).toBeInTheDocument()
    expect(screen.getByText('0 / 4')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Review progress' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Good' })).not.toBeInTheDocument()

    await user.click(await screen.findByRole('button', { name: 'Show answer' }))
    expect(
      await screen.findByText('Corroboration compares independent sources to test reliability.'),
    ).toBeInTheDocument()
    expect(screen.getByText('46%')).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Good' })).toBeInTheDocument()
    await user.click(await screen.findByRole('button', { name: 'Good' }))

    expect(await screen.findByText('CLOZE')).toBeInTheDocument()
    expect(screen.getByText('1 / 4')).toBeInTheDocument()
    await user.click(await screen.findByRole('button', { name: 'Show answer' }))
    expect(await screen.findByText('public narratives')).toBeInTheDocument()
    expect(screen.getByText('82%')).toBeInTheDocument()
    await user.click(await screen.findByRole('button', { name: 'Good' }))

    expect(await screen.findByText('CLOZE')).toBeInTheDocument()
    expect(screen.getByText('2 / 4')).toBeInTheDocument()
    await user.click(await screen.findByRole('button', { name: 'Show answer' }))
    expect(await screen.findByText('archives')).toBeInTheDocument()
    expect(screen.getByText('38%')).toBeInTheDocument()
    await user.click(await screen.findByRole('button', { name: 'Good' }))

    expect(
      await screen.findByText('Which principle distributes power across branches?'),
    ).toBeInTheDocument()
    expect(screen.getByText('3 / 4')).toBeInTheDocument()
    expect(screen.queryByText('Collective Memory')).not.toBeInTheDocument()
  })

  it('hides the answer again when practice repeats the same single card', async () => {
    const user = userEvent.setup()
    const services = createSingleCardPracticeReviewServices(
      createBasicReviewCard({
        back: 'Repeat until the answer is recalled cleanly.',
        front: 'Single practice card',
        id: 'single-practice-card:basic',
        progress: 44,
      }),
    )

    renderRoute('/dashboard/independent-study/decks/world-history/review', { services })

    expect(await screen.findByRole('heading', { name: 'Review' })).toBeInTheDocument()
    expect(await screen.findByText('Single practice card')).toBeInTheDocument()
    expect(screen.getByText('Reviewed 0')).toHaveClass('sr-only')

    await user.click(await screen.findByRole('button', { name: 'Show answer' }))
    expect(
      await screen.findByText('Repeat until the answer is recalled cleanly.'),
    ).toBeInTheDocument()

    await user.click(await screen.findByRole('button', { name: 'Good' }))

    expect(await screen.findByRole('button', { name: 'Show answer' })).toBeInTheDocument()
    expect(screen.getByText('Reviewed 1')).toHaveClass('sr-only')
    expect(screen.queryByRole('button', { name: 'Good' })).not.toBeInTheDocument()
    expect(
      screen.queryByText('Repeat until the answer is recalled cleanly.'),
    ).not.toBeInTheDocument()
  })

  it('closes review back to the deck instead of returning to the review session', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute('/dashboard/independent-study/decks/world-history/review')

    await user.click(await screen.findByRole('button', { name: 'Close' }))

    await waitFor(() =>
      expect(router.state.location.pathname).toBe(
        '/dashboard/independent-study/decks/world-history',
      ),
    )
    expect(
      await screen.findByRole('heading', { name: 'World History' }),
    ).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Notes' })).toBeInTheDocument()
  })

  it('closes review to the consumed review return target when one is stored', async () => {
    const user = userEvent.setup()
    saveReviewReturnTarget(
      'independent-study',
      'world-history',
      '/dashboard/independent-study/folders/reading-notes',
    )
    const { router } = renderRoute('/dashboard/independent-study/decks/world-history/review')

    await user.click(await screen.findByRole('button', { name: 'Close' }))

    await waitFor(() =>
      expect(router.state.location.pathname).toBe(
        '/dashboard/independent-study/folders/reading-notes',
      ),
    )
    expect(consumeReviewReturnTarget('independent-study', 'world-history')).toBeUndefined()
  })

  it('shows the review next step when no reviewable card is available', async () => {
    const services = createAppServices('mock')
    services.review = {
      ...services.review,
      start: async () => ok({ mode: 'unavailable', reason: 'empty-deck' }),
    }

    renderRoute('/dashboard/independent-study/decks/world-history/review', { services })

    expect(await screen.findByText('No cards to review')).toBeInTheDocument()
    expect(
      await screen.findByText(
        'Add a note so this deck can enter the review queue.',
      ),
    ).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'New note' })).toHaveAttribute(
      'href',
      '/dashboard/independent-study/decks/world-history/notes/new/basic',
    )
    expect(await screen.findByRole('link', { name: 'Back to deck' })).toHaveAttribute(
      'href',
      '/dashboard/independent-study/decks/world-history',
    )
  })

  it('renders an explicit error state when the review deck cannot be loaded', async () => {
    const baseServices = createAppServices('mock')
    const firstCardResult = await baseServices.review.start('world-history')
    if (!firstCardResult.ok || firstCardResult.value.mode === 'unavailable') {
      throw new Error('Expected a review session')
    }
    const firstSession = firstCardResult.value
    const services = {
      ...baseServices,
      decks: {
        ...baseServices.decks,
        getById: async () => err(domainError.notFound('Deck not found.')),
      },
      review: {
        ...baseServices.review,
        start: () => Promise.resolve(firstCardResult),
        get: async () => ok(firstSession),
      },
    }

    renderRoute('/dashboard/independent-study/decks/world-history/review', { services })

    expect(await screen.findByText('Review could not be loaded')).toBeInTheDocument()
    expect(await screen.findByText('We could not find this item.')).toBeInTheDocument()
  })
})
