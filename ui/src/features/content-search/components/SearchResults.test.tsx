import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { SearchResults } from './SearchResults'

const defaultProps = {
  emptyDescription: 'Try another keyword.',
  emptyTitle: 'No results found',
  query: 'memory',
}

describe('SearchResults', () => {
  it('renders a loading state instead of an empty state while searching', () => {
    render(<SearchResults {...defaultProps} loading />)

    expect(screen.getByRole('heading', { name: 'Search results' })).toBeInTheDocument()
    expect(screen.getByRole('status', { name: 'Searching content' })).toBeInTheDocument()
    expect(screen.queryByText('No results found')).not.toBeInTheDocument()
  })

  it('does not show an empty state while result groups are not available yet', () => {
    render(<SearchResults {...defaultProps} />)

    expect(screen.getByRole('heading', { name: 'Search results' })).toBeInTheDocument()
    expect(screen.queryByRole('status', { name: 'Searching content' })).not.toBeInTheDocument()
    expect(screen.queryByText('No results found')).not.toBeInTheDocument()
  })

  it('renders an empty state once search resolves with no groups', () => {
    render(<SearchResults {...defaultProps} groups={[]} />)

    expect(screen.getByText('No results found')).toBeInTheDocument()
    expect(screen.getByText('Try another keyword.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument()
  })

  it('renders a clear search action when provided', () => {
    const onClearSearch = vi.fn()

    render(<SearchResults {...defaultProps} groups={[]} onClearSearch={onClearSearch} />)

    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }))

    expect(onClearSearch).toHaveBeenCalledTimes(1)
  })
})
