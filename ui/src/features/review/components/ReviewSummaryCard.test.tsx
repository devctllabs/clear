import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { StorybookRouterProvider } from '@/test/storybook/router'
import type { DueReviewSession } from '../types/review.types'

import { ReviewSummaryCard } from './ReviewSummaryCard'

const summary = {
  deckId: 'world-history',
  durationSeconds: 720,
  id: 'world-history-review',
  mode: 'due',
  plannedCount: 42,
  reviewedCount: 24,
  startedAt: '2026-05-16T12:00:00.000Z',
  status: 'completed',
} satisfies DueReviewSession

const renderSummaryCard = (summaryOverride?: Partial<DueReviewSession>) =>
  render(
    <StorybookRouterProvider>
      <ReviewSummaryCard
        backTo="/dashboard/independent-study/decks/world-history"
        summary={{
          ...summary,
          ...summaryOverride,
        }}
      />
    </StorybookRouterProvider>,
  )

describe('ReviewSummaryCard', () => {
  it('renders summary metrics and route actions', () => {
    renderSummaryCard()

    expect(screen.getByRole('heading', { name: 'Review complete' })).toBeInTheDocument()
    expect(screen.getByText('Your progress was saved to this deck.')).toBeInTheDocument()
    expect(screen.getByText('24')).toBeInTheDocument()
    expect(screen.getByText('12m')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to deck' })).toHaveAttribute(
      'href',
      '/dashboard/independent-study/decks/world-history',
    )
  })

  it.each([
    [45, '45s'],
    [89, '1m'],
    [90, '2m'],
    [7260, '2h 1m'],
  ])('formats %i review duration seconds as %s', (durationSeconds, expectedLabel) => {
    renderSummaryCard({ durationSeconds })

    expect(screen.getByText(expectedLabel)).toBeInTheDocument()
  })

  it('normalizes invalid summary metrics before rendering them', () => {
    renderSummaryCard({
      durationSeconds: Number.NaN,
      reviewedCount: Number.NaN,
    })

    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('0s')).toBeInTheDocument()
    expect(screen.queryByText(/NaN|Infinity/)).not.toBeInTheDocument()
  })

  it('renders without summary data', () => {
    render(
      <StorybookRouterProvider>
        <ReviewSummaryCard
          backTo="/dashboard/independent-study/decks/world-history"
        />
      </StorybookRouterProvider>,
    )

    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('0s')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Continue review' })).not.toBeInTheDocument()
  })
})
