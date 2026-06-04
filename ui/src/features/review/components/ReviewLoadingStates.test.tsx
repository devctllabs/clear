import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ReviewSummaryLoadingState } from './ReviewLoadingStates'

describe('ReviewSummaryLoadingState', () => {
  it('reserves the summary action layout while data is loading', () => {
    const { container } = render(<ReviewSummaryLoadingState />)

    const card = container.querySelector('[data-slot="review-summary-loading-card"]')
    const actionStack = container.querySelector('[data-slot="review-summary-loading-actions"]')
    const actions = container.querySelectorAll('[data-slot="review-summary-loading-action"]')

    expect(screen.getByRole('status', { name: 'Loading summary' })).toBeInTheDocument()
    expect(card).not.toBeNull()
    expect(actionStack).toHaveClass('flex', 'flex-col', 'gap-3')
    expect(actions).toHaveLength(2)
    actions.forEach((action) => {
      expect(action).toHaveClass('h-12', 'w-full', 'rounded-full')
    })
  })
})
