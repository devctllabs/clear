import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { DeckNotesSearchSection } from './DeckNotesSearchSection'

describe('DeckNotesSearchSection', () => {
  it('uses non-sticky search and the mobile rhythm on desktop', () => {
    const onQueryChange = vi.fn()

    render(
      <DeckNotesSearchSection
        query=""
        variant="desktop"
        onQueryChange={onQueryChange}
      >
        <h2>Notes</h2>
      </DeckNotesSearchSection>,
    )

    const input = screen.getByPlaceholderText('Search notes…')
    const notesHeading = screen.getByRole('heading', { name: 'Notes' })

    expect(screen.getByRole('region', { name: 'Deck notes search' })).toHaveClass(
      'desktop-detail-main',
      'flex',
      'max-w-section',
    )
    expect(input.closest('.sticky')).toBeNull()
    expect(input.closest('label')).toHaveClass('mb-0', 'mt-0')
    expect(input.closest('label')).not.toHaveClass('mb-2')
    expect(input.closest('label')).not.toHaveClass('mt-2')
    expect(notesHeading.closest('.mt-8')).not.toBeNull()

    fireEvent.change(input, { target: { value: 'memory' } })

    expect(onQueryChange).toHaveBeenCalledTimes(1)
  })

  it('keeps mobile sticky search and active-search scroll anchoring', () => {
    render(
      <DeckNotesSearchSection
        query="memory"
        searchActive
        variant="mobile"
        onQueryChange={() => undefined}
      >
        <h2>Notes</h2>
      </DeckNotesSearchSection>,
    )

    const region = screen.getByRole('region', { name: 'Deck notes search' })
    const input = screen.getByPlaceholderText('Search notes…')
    const notesHeading = screen.getByRole('heading', { name: 'Notes' })

    expect(region).toHaveClass('min-h-[75dvh]')
    expect(input.closest('.sticky')).not.toBeNull()
    expect(notesHeading.closest('.mt-4')).toBeNull()
    expect(notesHeading.closest('.mt-6')).toBeNull()
    expect(notesHeading.closest('.mt-8')).toBeNull()
  })
})
