import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { domainError } from '@shared/errors'
import { StorybookRouterProvider } from '@/test/storybook/router'

import { InlineErrorState, LoadErrorState } from './LoadErrorState'

const retryableError = domainError.unavailable('The service is temporarily unavailable.')

const renderWithRouter = (element: ReactNode) =>
  render(<StorybookRouterProvider>{element}</StorybookRouterProvider>)

describe('LoadErrorState', () => {
  it('uses compact centered actions for section errors', () => {
    render(
      <LoadErrorState
        error={retryableError}
        title="Deck could not be loaded"
        onRetry={vi.fn()}
      />,
    )

    const retryButton = screen.getByRole('button', { name: 'Try again' })
    const actionGroup = retryButton.parentElement

    expect(actionGroup).toHaveClass('items-center')
    expect(retryButton).toHaveClass('min-w-36', 'px-6', 'py-3.5')
    expect(retryButton).not.toHaveClass('w-full')
  })

  it('keeps full-width actions for page and fullscreen errors', () => {
    const onRetry = vi.fn()

    const { rerender } = render(
      <LoadErrorState
        error={retryableError}
        title="Deck could not be loaded"
        variant="page"
        onRetry={onRetry}
      />,
    )

    expect(screen.getByRole('button', { name: 'Try again' })).toHaveClass('w-full', 'py-4')

    rerender(
      <LoadErrorState
        error={retryableError}
        title="Deck could not be loaded"
        variant="fullscreen"
        onRetry={onRetry}
      />,
    )

    expect(screen.getByRole('button', { name: 'Try again' })).toHaveClass('w-full', 'py-4')
  })

  it('uses compact back links for section errors', () => {
    renderWithRouter(
      <LoadErrorState
        backLabel="Back to deck"
        backTo="/"
        error={domainError.notFound('Deck not found.')}
        showRetry={false}
        title="Deck could not be loaded"
      />,
    )

    const backLink = screen.getByRole('link', { name: 'Back to deck' })

    expect(backLink).toHaveClass('min-w-36', 'px-6', 'py-3.5')
    expect(backLink).not.toHaveClass('w-full')
  })

  it('uses the card radius token for inline errors', () => {
    render(
      <InlineErrorState
        error={retryableError}
        title="Could not load folder path"
      />,
    )

    expect(screen.getByRole('alert')).toHaveClass('rounded-card')
  })
})
