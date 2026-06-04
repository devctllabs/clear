import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { StorybookRouterProvider } from '@/test/storybook/router'
import type { SortPreference } from '@shared/types/sort.types'

import type { NoteListItem } from '../types/note.types'
import { NoteList } from './NoteList'

const sort: SortPreference = {
  direction: 'desc',
  field: 'updated',
}

const createNote = (note: Partial<NoteListItem> = {}): NoteListItem => ({
  dueAt: '2026-05-05T10:00:00.000Z',
  id: 'memory-note',
  kind: 'cloze',
  progress: 46,
  reviewedAt: '2026-04-27T10:00:00.000Z',
  status: 'in-progress',
  title: 'Memory Consolidation',
  updatedAt: '2026-05-02T10:00:00.000Z',
  ...note,
})

const renderNoteList = (notes: NoteListItem[]) => {
  render(
    <StorybookRouterProvider>
      <NoteList
        deckId="world-history"
        notes={notes}
        sort={sort}
        workspaceId="independent-study"
        onDelete={vi.fn()}
        onSortChange={vi.fn()}
      />
    </StorybookRouterProvider>,
  )
}

describe('NoteList', () => {
  it('renders note statuses as quiet metadata chips', () => {
    renderNoteList([
      createNote({ id: 'learning-note', status: 'in-progress' }),
      createNote({ id: 'mastered-note', status: 'mastered', title: 'Mastered Topic' }),
    ])

    const inProgress = screen.getByText('In progress')
    const mastered = screen.getByText('Mastered')

    expect(inProgress).toHaveClass('border-border', 'text-muted-foreground')
    expect(mastered).toHaveClass('border-border', 'text-muted-foreground')
    expect(inProgress).not.toHaveClass('uppercase')
    expect(inProgress).not.toHaveClass('bg-primary')
    expect(mastered).not.toHaveClass('uppercase')
    expect(mastered).not.toHaveClass('bg-primary')
    expect(mastered).not.toHaveClass('text-primary-foreground')
    const noteLink = screen.getByRole('link', { name: 'Open Memory Consolidation' })

    expect(noteLink).toHaveClass('card-focus-ring')
    expect(noteLink).toHaveAttribute(
      'href',
      '/dashboard/independent-study/decks/world-history/notes/learning-note',
    )
    expect(screen.getByRole('button', { name: 'Memory Consolidation actions' })).toHaveClass(
      'card-focus-ring',
    )
  })
})
