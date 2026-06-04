import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createAppServices } from '@core/services'
import { ok } from '@shared/errors'
import {
  consumeReviewReturnTarget,
  saveReviewReturnTarget,
} from '@shared/lib/navigation-state'
import type { DueReviewSession } from '../types/review.types'
import { renderRoute } from '@/test/renderRoute'

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((next) => {
    resolve = next
  })

  return { promise, resolve }
}

const summary: DueReviewSession = {
  completedAt: '2026-05-16T12:18:00.000Z',
  deckId: 'world-history',
  durationSeconds: 1080,
  id: 'world-history-review',
  mode: 'due',
  plannedCount: 42,
  reviewedCount: 24,
  startedAt: '2026-05-16T12:00:00.000Z',
  status: 'completed',
}

describe('ReviewSummaryPage', () => {
  afterEach(() => {
    vi.useRealTimers()
    window.sessionStorage.clear()
  })

  it('delays the summary skeleton while initial data is loading', async () => {
    vi.useFakeTimers()
    const baseServices = createAppServices('mock')
    const pendingSummary =
      createDeferred<Awaited<ReturnType<typeof baseServices.review.get>>>()
    const services = {
      ...baseServices,
      review: {
        ...baseServices.review,
        get: () => pendingSummary.promise,
      },
    }

    renderRoute('/dashboard/independent-study/decks/world-history/review/world-history-review/summary', {
      services,
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(screen.queryByRole('status', { name: 'Loading summary' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Review complete' })).not.toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(179)
    })
    expect(screen.queryByRole('status', { name: 'Loading summary' })).not.toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })
    expect(screen.getByRole('status', { name: 'Loading summary' })).toBeInTheDocument()
  })

  it('renders summary without showing the skeleton when initial data resolves quickly', async () => {
    vi.useFakeTimers()
    const baseServices = createAppServices('mock')
    const summaryResult = ok(summary)
    const pendingSummary =
      createDeferred<Awaited<ReturnType<typeof baseServices.review.get>>>()
    const services = {
      ...baseServices,
      review: {
        ...baseServices.review,
        get: () => pendingSummary.promise,
      },
    }

    renderRoute('/dashboard/independent-study/decks/world-history/review/world-history-review/summary', {
      services,
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(screen.queryByRole('status', { name: 'Loading summary' })).not.toBeInTheDocument()

    await act(async () => {
      pendingSummary.resolve(summaryResult)
      await pendingSummary.promise
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(screen.getByRole('heading', { name: 'Review complete' })).toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(180)
    })
    expect(screen.queryByRole('status', { name: 'Loading summary' })).not.toBeInTheDocument()
  })

  it('renders summary actions and finishes back to deck details', async () => {
    const user = userEvent.setup()
    const baseServices = createAppServices('mock')
    const services = {
      ...baseServices,
      review: {
        ...baseServices.review,
        get: () => Promise.resolve(ok(summary)),
      },
    }

    renderRoute('/dashboard/independent-study/decks/world-history/review/world-history-review/summary', {
      services,
    })

    expect(await screen.findByRole('heading', { name: 'Review complete' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Continue review' })).toHaveAttribute(
      'href',
      '/dashboard/independent-study/decks/world-history/review',
    )

    await user.click(await screen.findByRole('link', { name: 'Back to deck' }))

    expect(
      await screen.findByRole('heading', { name: 'World History' }),
    ).toBeInTheDocument()
  })

  it('uses a consumed review return target for the summary back action', async () => {
    const baseServices = createAppServices('mock')
    const services = {
      ...baseServices,
      review: {
        ...baseServices.review,
        get: () => Promise.resolve(ok(summary)),
      },
    }

    saveReviewReturnTarget(
      'independent-study',
      'world-history',
      '/dashboard/independent-study/folders/reading-notes',
    )

    renderRoute('/dashboard/independent-study/decks/world-history/review/world-history-review/summary', {
      services,
    })

    expect(await screen.findByRole('heading', { name: 'Review complete' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      '/dashboard/independent-study/folders/reading-notes',
    )
    expect(consumeReviewReturnTarget('independent-study', 'world-history')).toBeUndefined()
  })
})
