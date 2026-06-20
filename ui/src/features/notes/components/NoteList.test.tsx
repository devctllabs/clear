import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { StorybookRouterProvider } from '@/test/storybook/router'

import type { NoteListItem, NoteSortPreference } from '../types/note.types'
import { NoteList } from './NoteList'

const sort: NoteSortPreference = {
  direction: 'desc',
  field: 'updatedAt',
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

const renderNoteList = (
  notes: NoteListItem[],
  {
    onSortChange = vi.fn(),
    sortPreference = sort,
  }: {
    onSortChange?: (sort: NoteSortPreference) => void
    sortPreference?: NoteSortPreference
  } = {},
) => {
  render(
    <StorybookRouterProvider>
      <NoteList
        deckId="world-history"
        notes={notes}
        sort={sortPreference}
        workspaceId="independent-study"
        onDelete={vi.fn()}
        onSortChange={onSortChange}
      />
    </StorybookRouterProvider>,
  )

  return { onSortChange }
}

describe('NoteList', () => {
  it('renders note statuses and progress as quiet metadata', () => {
    renderNoteList([
      createNote({ id: 'learning-note', status: 'in-progress' }),
      createNote({
        id: 'mastered-note',
        progress: 100,
        status: 'mastered',
        title: 'Mastered Topic',
      }),
    ])

    const inProgress = screen.getByText('In progress')
    const mastered = screen.getByText('Mastered')
    const progress = screen.getByLabelText('Review progress: 46%')

    expect(inProgress).toHaveClass('border-border', 'text-muted-foreground')
    expect(mastered).toHaveClass('border-border', 'text-muted-foreground')
    expect(progress).toHaveClass('type-technical', 'text-muted-foreground')
    expect(progress).toHaveTextContent('46%')
    expect(screen.getByLabelText('Review progress: 100%')).toHaveTextContent('100%')
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

  it('offers progress as a note sort field', async () => {
    const user = userEvent.setup()
    const onSortChange = vi.fn()

    renderNoteList(
      [
        createNote({ id: 'learning-note', status: 'in-progress' }),
        createNote({ id: 'mastered-note', progress: 100, status: 'mastered' }),
      ],
      { onSortChange },
    )

    await user.click(screen.getByRole('button', { name: 'Sort notes' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Review progress' }))

    expect(onSortChange).toHaveBeenCalledWith({ direction: 'desc', field: 'progress' })
  })
})
