import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import type { NoteDetail } from '../types/note.types'
import { NoteDetailContent } from './NoteDetailContent'

const baseNote = {
  deckId: 'world-history',
  dueAt: '2026-05-05T10:00:00.000Z',
  id: 'memory-note',
  progress: 46,
  reviewedAt: '2026-04-27T10:00:00.000Z',
  status: 'in-progress',
  title: 'Memory Consolidation',
  updatedAt: '2026-05-02T10:00:00.000Z',
} as const

const basicNote = {
  ...baseNote,
  editor: {
    back: 'The *hippocampus* consolidates `short-term` memories.',
    front: 'Which **structure** supports memory consolidation?',
  },
  kind: 'basic',
} satisfies Extract<NoteDetail, { kind: 'basic' }>

const clozeNote = {
  ...baseNote,
  cards: [
    {
      clozeId: 'c1',
      dueAt: '2026-05-06T10:00:00.000Z',
      id: 'memory-note:c1',
      progress: 82,
      reviewedAt: '2026-05-01T10:00:00.000Z',
      status: 'mastered',
      title: 'Hippocampus Cloze',
    },
  ],
  editor: {
    body: 'The {{c1::**hippocampus**}} supports *consolidation*.',
  },
  kind: 'cloze',
} satisfies Extract<NoteDetail, { kind: 'cloze' }>

describe('NoteDetailContent', () => {
  it('renders a basic note detail card', () => {
    render(<NoteDetailContent note={basicNote} />)

    expect(screen.getByText('BASIC')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Memory Consolidation' })).toBeInTheDocument()
    expect(screen.getByText('structure').closest('strong')).toBeInTheDocument()
    expect(screen.getByText('hippocampus').closest('em')).toBeInTheDocument()
    expect(screen.getByText('short-term').tagName).toBe('CODE')
    expect(screen.getByText('IN PROGRESS')).toBeInTheDocument()
  })

  it('renders a cloze note detail card with derived cards', () => {
    render(<NoteDetailContent note={clozeNote} />)

    expect(screen.getByText('CLOZE')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Memory Consolidation' })).toBeInTheDocument()
    expect(screen.getByText('hippocampus').closest('strong')).toBeInTheDocument()
    expect(
      screen.getByText('hippocampus').closest('[data-cloze-state="revealed"]'),
    ).toBeInTheDocument()
    expect(screen.getByText('consolidation').closest('em')).toBeInTheDocument()
    expect(screen.getByText('DERIVED CARDS')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Hippocampus Cloze' })).toBeInTheDocument()
  })

  it('normalizes invalid basic note progress before rendering metrics', () => {
    render(
      <NoteDetailContent
        note={{ ...basicNote, progress: Number.NaN }}
      />,
    )

    expect(screen.getByText('0%')).toBeInTheDocument()
    expect(screen.queryByText(/NaN|Infinity/)).not.toBeInTheDocument()
  })

  it('clamps derived card progress before rendering metrics', () => {
    render(
      <NoteDetailContent
        note={{
          ...clozeNote,
          cards: [{ ...clozeNote.cards[0], progress: 148 }],
        }}
      />,
    )

    expect(screen.getByText('100%')).toBeInTheDocument()
    expect(screen.queryByText('148%')).not.toBeInTheDocument()
  })

  it('toggles the cloze derived cards note without removing its reserved space', async () => {
    const user = userEvent.setup()
    render(<NoteDetailContent note={clozeNote} />)

    const clozeCardsHeading = screen.getByText('DERIVED CARDS')
    const helper = screen.getByText('Notes are the source of truth for derived cards.')
    const button = screen.getByRole('button', { name: 'Show derived cards note' })

    expect(clozeCardsHeading.compareDocumentPosition(helper)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
    expect(clozeCardsHeading.parentElement).toHaveClass('gap-2')
    expect(clozeCardsHeading.parentElement).not.toHaveClass('justify-between')
    expect(button).toHaveClass('-ml-1')
    expect(button).toHaveAttribute('aria-controls', helper.id)
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(helper).toHaveAttribute('aria-hidden', 'true')
    expect(helper).toHaveClass(
      'opacity-0',
      'pointer-events-none',
      'min-h-[1.25rem]',
    )
    expect(helper).not.toHaveClass('mt-2')
    expect(helper.parentElement?.nextElementSibling).toHaveClass('mt-3', 'space-y-8')

    await user.click(button)

    expect(
      screen.getByRole('button', { name: 'Hide derived cards note' }),
    ).toHaveAttribute('aria-expanded', 'true')
    expect(helper).toHaveAttribute('aria-hidden', 'false')
    expect(helper).toHaveClass('opacity-100')
    expect(helper).not.toHaveClass('opacity-0')
  })

  it('renders desktop basic note content without inline title or metadata', () => {
    render(<NoteDetailContent note={basicNote} variant="desktop" />)

    const card = screen.getByText('FRONT').closest('article')

    expect(card).toBeInTheDocument()
    expect(within(card as HTMLElement).getByText('BASIC')).toBeInTheDocument()
    expect(
      within(card as HTMLElement).queryByRole('heading', { name: 'Memory Consolidation' }),
    ).not.toBeInTheDocument()
    expect(within(card as HTMLElement).queryByText(/UPDATED/)).not.toBeInTheDocument()
    expect(within(card as HTMLElement).queryByText('Learning')).not.toBeInTheDocument()
    expect(within(card as HTMLElement).queryByText(/Reviewed:/)).not.toBeInTheDocument()
    expect(within(card as HTMLElement).getByText('FRONT')).toBeInTheDocument()
    expect(within(card as HTMLElement).getByText('BACK')).toBeInTheDocument()
  })

  it('renders desktop cloze note content without inline title or metadata', () => {
    render(<NoteDetailContent note={clozeNote} variant="desktop" />)

    const card = screen.getByText('DERIVED CARDS').closest('article')

    expect(card).toBeInTheDocument()
    expect(within(card as HTMLElement).getByText('CLOZE')).toBeInTheDocument()
    expect(
      within(card as HTMLElement).queryByRole('heading', { name: 'Memory Consolidation' }),
    ).not.toBeInTheDocument()
    expect(within(card as HTMLElement).queryByText(/UPDATED/)).not.toBeInTheDocument()
    expect(within(card as HTMLElement).getByText('NOTE BODY')).toBeInTheDocument()
    expect(within(card as HTMLElement).getByText('DERIVED CARDS')).toBeInTheDocument()
    expect(
      within(card as HTMLElement).getByRole('heading', { name: 'Hippocampus Cloze' }),
    ).toBeInTheDocument()
  })
})
