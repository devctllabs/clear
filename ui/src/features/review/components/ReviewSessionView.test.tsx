import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { ReviewCard } from '../types/review.types'

import {
  ReviewSessionActions,
  ReviewSessionContent,
  ReviewSessionHeader,
} from './ReviewSessionView'

const baseNote = {
  id: 'source-note:basic',
  progress: 46,
} as const

const basicNote = {
  ...baseNote,
  back: 'Corroboration compares independent sources to test whether an account is reliable.',
  front: 'Which practice checks a source against independent evidence?',
  kind: 'basic',
} satisfies Extract<ReviewCard, { kind: 'basic' }>

const basicMarkdownNote = {
  ...baseNote,
  back: 'The *archive record* supports `source triangulation`.',
  front: 'Review **source analysis**:\n\n- Provenance\n- Context\n\nUse `corroboration` cues.',
  kind: 'basic',
} satisfies Extract<ReviewCard, { kind: 'basic' }>

const clozeNote = {
  ...baseNote,
  body:
    '**The archive** links {{c1::**public narrative**}} to {{c2::*institutional context*}} with `evidence`.',
  clozeId: 'c1',
  id: 'source-note:c1',
  kind: 'cloze',
} satisfies Extract<ReviewCard, { kind: 'cloze' }>

const sessionProgress = {
  plannedCount: 42,
  reviewedCount: 14,
} as const

describe('ReviewSessionView', () => {
  it('renders recall progress from the active review card only after reveal', () => {
    const firstCard = {
      ...basicNote,
      id: 'source-note:basic',
      progress: 37,
    } satisfies Extract<ReviewCard, { kind: 'basic' }>
    const nextCard = {
      ...basicNote,
      id: 'next-source-note:basic',
      progress: 81,
    } satisfies Extract<ReviewCard, { kind: 'basic' }>
    const { rerender } = render(
      <ReviewSessionContent
        card={firstCard}
        deckTitle="World History"
        plannedCount={10}
        revealed={false}
        reviewedCount={0}
      />,
    )

    expect(screen.queryByText('37%')).not.toBeInTheDocument()

    rerender(
      <ReviewSessionContent
        card={firstCard}
        deckTitle="World History"
        plannedCount={10}
        revealed
        reviewedCount={0}
      />,
    )

    expect(screen.getByText('37%')).toBeInTheDocument()

    rerender(
      <ReviewSessionContent
        card={nextCard}
        deckTitle="World History"
        plannedCount={10}
        revealed={false}
        reviewedCount={1}
      />,
    )

    expect(screen.queryByText('37%')).not.toBeInTheDocument()
    expect(screen.queryByText('81%')).not.toBeInTheDocument()

    rerender(
      <ReviewSessionContent
        card={nextCard}
        deckTitle="World History"
        plannedCount={10}
        revealed
        reviewedCount={1}
      />,
    )

    expect(screen.getByText('81%')).toBeInTheDocument()
  })

  it('renders a basic review card before and after reveal', () => {
    const { rerender } = render(
      <ReviewSessionContent
        card={basicNote}
        deckTitle="World History"
        revealed={false}
        {...sessionProgress}
      />,
    )

    expect(screen.getByText('World History')).toBeInTheDocument()
    expect(screen.getByText('World History')).toHaveClass('text-wrap-anywhere')
    expect(screen.getByText('14 / 42')).toBeInTheDocument()
    expect(screen.getByText('33%')).toBeInTheDocument()
    expect(screen.getByText('BASIC')).toHaveClass('rounded-full')
    expect(screen.getByText('BASIC').closest('article')).toHaveClass(
      'min-w-0',
      'px-6',
      'sm:px-12',
    )
    expect(
      screen.getByText('Which practice checks a source against independent evidence?'),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', {
        name: 'Which practice checks a source against independent evidence?',
      }),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('Source Corroboration')).not.toBeInTheDocument()
    expect(
      screen.queryByText(
        'Corroboration compares independent sources to test whether an account is reliable.',
      ),
    ).not.toBeInTheDocument()

    rerender(
      <ReviewSessionContent
        card={basicNote}
        deckTitle="World History"
        revealed
        {...sessionProgress}
      />,
    )

    expect(
      screen.getByText(
        'Corroboration compares independent sources to test whether an account is reliable.',
      ),
    ).toBeInTheDocument()
    expect(screen.queryByText('Source Corroboration')).not.toBeInTheDocument()
    expect(screen.getByText('46%')).toBeInTheDocument()
  })

  it('renders practice progress as an accessible check counter', () => {
    render(
      <ReviewSessionContent
        card={basicNote}
        deckTitle="World History"
        progressMode="reviewed-only"
        revealed={false}
        reviewedCount={14}
      />,
    )

    const reviewedLabel = screen.getByText('Reviewed 14')
    const counter = reviewedLabel.parentElement
    const value = screen.getByText('14')

    expect(reviewedLabel).toHaveClass('sr-only')
    expect(counter).toHaveClass('flex', 'justify-center', 'gap-3')
    const icon = counter?.querySelector('svg')

    expect(icon).toHaveAttribute('aria-hidden', 'true')
    expect(icon).toHaveClass(
      'text-foreground/45',
      '[[data-theme=dark]_&]:text-muted-foreground/60',
    )
    expect(value).toHaveAttribute('aria-hidden', 'true')
    expect(value).toHaveClass(
      'font-mono',
      'text-[1.25rem]',
      'font-bold',
      'tabular-nums',
      'text-foreground/75',
      '[[data-theme=dark]_&]:text-muted-foreground',
    )
    expect(screen.queryByRole('progressbar', { name: 'Review progress' })).not.toBeInTheDocument()
  })

  it('renders markdown in basic front and back content', () => {
    const { rerender } = render(
      <ReviewSessionContent
        deckTitle="World History"
        card={basicMarkdownNote}
        revealed={false}
      />,
    )

    expect(screen.getByText('source analysis').closest('strong')).toBeInTheDocument()
    expect(screen.getByRole('list')).toBeInTheDocument()
    expect(screen.getByText('Provenance').closest('li')).toBeInTheDocument()
    expect(screen.getByText('corroboration').tagName).toBe('CODE')
    expect(screen.queryByText('archive record')).not.toBeInTheDocument()

    rerender(
      <ReviewSessionContent
        deckTitle="World History"
        card={basicMarkdownNote}
        revealed
      />,
    )

    expect(screen.getByText('archive record').closest('em')).toBeInTheDocument()
    expect(screen.getByText('source triangulation').tagName).toBe('CODE')
  })

  it('masks the active cloze before reveal and exposes it after reveal', () => {
    const { rerender } = render(
      <ReviewSessionContent card={clozeNote} deckTitle="World History" revealed={false} />,
    )

    expect(screen.getByText('•••')).toBeInTheDocument()
    expect(screen.getByText('CLOZE')).toHaveClass('rounded-full')
    expect(screen.getByText('The archive').closest('strong')).toBeInTheDocument()
    expect(screen.getByText('institutional context').closest('em')).toBeInTheDocument()
    expect(screen.getByText('evidence').tagName).toBe('CODE')
    expect(screen.queryByText('public narrative')).not.toBeInTheDocument()

    rerender(
      <ReviewSessionContent card={clozeNote} deckTitle="World History" revealed />,
    )

    expect(screen.getByText('public narrative').closest('strong')).toBeInTheDocument()
    expect(
      screen.getByText('public narrative').closest('[data-cloze-state="revealed"]'),
    ).toBeInTheDocument()
  })

  it('renders the action area inside the review content lane', () => {
    render(
      <ReviewSessionContent
        actions={<button type="button">Action slot</button>}
        card={basicNote}
        deckTitle="World History"
        revealed={false}
      />,
    )

    const action = screen.getByRole('button', { name: 'Action slot' })
    const actionArea = action.closest('[data-slot="review-session-action-area"]')

    expect(actionArea).toHaveClass('md:mt-10', 'md:space-y-3')
  })

  it('delegates close, reveal, and grade actions', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onGrade = vi.fn()
    const onReveal = vi.fn()

    const { rerender } = render(
      <>
        <ReviewSessionHeader onClose={onClose} />
        <ReviewSessionActions revealed={false} onGrade={onGrade} onReveal={onReveal} />
      </>,
    )

    const close = screen.getByRole('button', { name: 'Close' })

    expect(close).toHaveClass(
      'text-foreground/70',
      'hover:bg-muted',
      'focus-visible:bg-background',
      'focus-visible:hover:bg-background',
    )
    expect(close).not.toHaveClass('bg-card', 'ring-border')
    expect(screen.getByRole('button', { name: 'Show answer' })).toHaveClass('min-h-14')
    expect(document.querySelector('footer')).toHaveClass(
      'bottom-[var(--visual-viewport-bottom-offset,0px)]',
      'md:static',
      'md:bg-transparent',
      'md:p-0',
    )

    await user.click(close)
    await user.click(screen.getByRole('button', { name: 'Show answer' }))

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onReveal).toHaveBeenCalledTimes(1)

    rerender(<ReviewSessionActions revealed onGrade={onGrade} onReveal={onReveal} />)
    const goodButton = screen.getByRole('button', { name: 'Good' })

    expect(goodButton).toHaveClass(
      'min-h-14',
      'bg-card',
      'text-foreground',
      'shadow-none',
    )
    expect(goodButton).not.toHaveClass('bg-primary', 'text-primary-foreground')
    await user.click(goodButton)
    expect(onGrade).toHaveBeenCalledWith('good')
  })
})
