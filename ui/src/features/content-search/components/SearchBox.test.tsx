import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SearchBox } from './SearchBox'

describe('SearchBox', () => {
  it('renders an accessible search input with safe defaults', () => {
    render(<SearchBox placeholder="Search content…" value="" onChange={() => undefined} />)

    const input = screen.getByRole('searchbox', { name: 'Search' })

    expect(input).toHaveAttribute('autocomplete', 'off')
    expect(input).toHaveAttribute('name', 'search')
    expect(input).not.toHaveClass('focus-visible:ring-2')
    expect(input).toHaveClass('keyboard-input-focus')
  })

  it('allows callers to provide a specific accessible label', () => {
    render(
      <SearchBox
        aria-label="Search deck notes"
        label="Ignored label"
        placeholder="Search notes…"
        value=""
        onChange={() => undefined}
      />,
    )

    expect(screen.getByRole('searchbox', { name: 'Search deck notes' })).toBeInTheDocument()
  })
})
