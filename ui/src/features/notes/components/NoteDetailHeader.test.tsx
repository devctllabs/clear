import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { StorybookRouterProvider } from '@/test/storybook/router'

import type { NoteDetail } from '../types/note.types'
import { NoteDetailHeader } from './NoteDetailHeader'

const note = {
  deckId: 'world-history',
  dueAt: '2026-05-05T10:00:00.000Z',
  editor: {
    back: 'Answer',
    front: 'Question',
  },
  id: 'memory-note',
  kind: 'basic',
  progress: 46,
  reviewedAt: '2026-04-27T10:00:00.000Z',
  status: 'in-progress',
  title: 'Memory Consolidation',
  updatedAt: '2026-05-02T10:00:00.000Z',
} satisfies Extract<NoteDetail, { kind: 'basic' }>

describe('NoteDetailHeader', () => {
  it('renders navigation and delegates menu actions', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    const onEdit = vi.fn()

    render(
      <StorybookRouterProvider>
        <NoteDetailHeader
          backTo="/dashboard/independent-study/decks/world-history"
          note={note}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      </StorybookRouterProvider>,
    )

    expect(screen.getByRole('heading', { name: 'Note Details' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      '/dashboard/independent-study/decks/world-history',
    )
    expect(screen.getByRole('link', { name: 'Back' }).parentElement).toHaveClass(
      'grid-cols-[44px_1fr_44px]',
      'min-h-11',
    )

    await user.click(screen.getByRole('button', { name: 'Memory Consolidation actions' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Edit' }))
    expect(onEdit).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole('button', { name: 'Memory Consolidation actions' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }))
    expect(onDelete).toHaveBeenCalledTimes(1)
  })
})
