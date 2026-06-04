import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DeckDetailLoadingState } from './DeckDetailLoadingState'

describe('DeckDetailLoadingState', () => {
  it('renders the mobile deck skeleton with a standardized notes list section', () => {
    const { container } = render(<DeckDetailLoadingState />)

    const status = screen.getByRole('status', { name: 'Loading deck' })

    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByText('Notes')).toBeInTheDocument()
    expect(container.querySelectorAll('[class*="shadow-card"]')).toHaveLength(2)
    expect(container.querySelectorAll('.border-t')).toHaveLength(2)
  })

  it('renders the desktop deck skeleton with a standardized notes list section', () => {
    const { container } = render(<DeckDetailLoadingState variant="desktop" />)

    const status = screen.getByRole('status', { name: 'Loading deck' })

    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByText('Notes')).toBeInTheDocument()
    expect(screen.getByText('Notes').closest('.mt-8')).not.toBeNull()
    expect(container.querySelectorAll('.border-t')).toHaveLength(2)
  })
})
