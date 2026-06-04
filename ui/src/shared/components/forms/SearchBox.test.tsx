import { Search, SlidersHorizontal } from 'lucide-react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SearchBox, SearchBoxSkeleton } from './SearchBox'

describe('shared SearchBox', () => {
  it('renders an accessible search input with default icon and keyboard-only focus', () => {
    render(<SearchBox placeholder="Search content..." value="" onChange={() => undefined} />)

    const input = screen.getByRole('searchbox', { name: 'Search' })

    expect(input).toHaveAttribute('autocomplete', 'off')
    expect(input).toHaveAttribute('name', 'search')
    expect(input).toHaveClass('text-base', 'sm:text-sm')
    expect(input).toHaveClass('keyboard-input-focus')
    expect(input).not.toHaveClass('focus-visible:ring-2')
    expect(input.previousElementSibling?.querySelector('svg')).toBeInTheDocument()
  })

  it('supports card and popover focus surfaces without forcing an icon', () => {
    render(
      <>
        <SearchBox
          aria-label="Card search"
          icon={false}
          surface="card"
          value=""
          onChange={() => undefined}
        />
        <SearchBox
          aria-label="Popover search"
          icon={false}
          surface="popover"
          value=""
          onChange={() => undefined}
        />
      </>,
    )

    expect(screen.getByRole('searchbox', { name: 'Card search' })).toHaveClass(
      'keyboard-card-input-focus',
    )
    expect(screen.getByRole('searchbox', { name: 'Popover search' })).toHaveClass(
      'keyboard-popover-input-focus',
    )
    expect(screen.getByRole('searchbox', { name: 'Card search' }).previousElementSibling).toBeNull()
  })

  it('accepts a custom icon and skeleton layout options', () => {
    render(
      <>
        <SearchBox
          icon={<SlidersHorizontal className="size-4" />}
          label="Filter"
          value=""
          onChange={() => undefined}
        />
        <SearchBoxSkeleton containerClassName="mt-2" icon={false} />
      </>,
    )

    expect(screen.getByRole('searchbox', { name: 'Filter' }).previousElementSibling).toHaveTextContent('')
    expect(screen.getByRole('searchbox', { name: 'Filter' }).previousElementSibling?.querySelector('svg')).toBeInTheDocument()
    expect(document.querySelector('.mt-2')).toBeInTheDocument()
  })

  it('allows callers to pass the default icon explicitly', () => {
    render(
      <SearchBox
        icon={<Search className="size-5" />}
        label="Explicit search"
        value=""
        onChange={() => undefined}
      />,
    )

    expect(screen.getByRole('searchbox', { name: 'Explicit search' })).toBeInTheDocument()
  })
})
