import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { Workspace } from '../types/workspace.types'
import { WorkspaceSpaceCard } from './WorkspaceSpaceCard'

const workspace: Workspace = {
  description: 'Reading notes, review decks, and reference material for ongoing study.',
  icon: 'layers-3',
  id: 'independent-study',
  title: 'Independent Study',
  updatedAt: '2026-04-24T12:00:00.000Z',
}

describe('WorkspaceSpaceCard', () => {
  it('opens workspace from pointer and keyboard interaction', async () => {
    const user = userEvent.setup()
    const onOpen = vi.fn()

    render(
      <WorkspaceSpaceCard
        active
        workspace={workspace}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onOpen={onOpen}
      />,
    )

    const card = screen.getByRole('button', { name: 'Open Independent Study' })
    const surface = card.closest('.relative')
    const activeBadge = screen.getByText('Active')

    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Reading notes, review decks, and reference material for ongoing study.')).toBeInTheDocument()
    expect(surface).toHaveClass(
      'border',
      'border-foreground/20',
      'bg-card',
      'shadow-none',
    )
    expect(surface).not.toHaveClass('bg-muted/35')
    expect(surface).not.toHaveClass('border-2', 'border-primary')
    expect(surface).not.toHaveClass('ring-1', 'ring-inset', 'ring-border/70')
    expect(surface).not.toHaveClass('hover:shadow-card')
    expect(activeBadge.parentElement).toHaveClass('items-center')
    expect(activeBadge.parentElement).not.toHaveClass('items-start')
    expect(activeBadge).toHaveClass('border-border', 'bg-card', 'text-muted-foreground')
    expect(activeBadge).not.toHaveClass('bg-primary', 'text-primary-foreground')
    expect(screen.getByText('Independent Study')).toHaveClass(
      'type-study-title',
      'sm:text-[1.5rem]',
    )
    expect(screen.getByText('Independent Study')).not.toHaveClass('sm:type-study-title')
    expect(document.querySelector('[data-slot="workspace-card-action-frame"]')).toHaveClass(
      'size-11',
    )

    await user.click(card)
    expect(onOpen).toHaveBeenCalledWith('independent-study')

    card.focus()
    await user.keyboard('{Enter}')
    expect(onOpen).toHaveBeenCalledTimes(2)
  })

  it('delegates edit and delete actions without opening the card', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    const onEdit = vi.fn()
    const onOpen = vi.fn()

    render(
      <WorkspaceSpaceCard
        active
        workspace={workspace}
        onDelete={onDelete}
        onEdit={onEdit}
        onOpen={onOpen}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Independent Study actions' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Edit' }))
    expect(onEdit).toHaveBeenCalledWith('independent-study')
    expect(onOpen).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Independent Study actions' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }))
    expect(onDelete).toHaveBeenCalledWith(workspace)
    expect(onOpen).not.toHaveBeenCalled()
  })

  it('keeps inactive workspace cards from lifting on hover', () => {
    render(
      <WorkspaceSpaceCard
        workspace={{ ...workspace, id: 'reading-archive', title: 'Reading Archive' }}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onOpen={vi.fn()}
      />,
    )

    const surface = screen.getByRole('button', { name: 'Open Reading Archive' }).closest('.relative')

    expect(surface).toHaveClass('shadow-card')
    expect(surface).not.toHaveClass('hover:shadow-floating')
  })

  it('renders compact cards as scannable mobile rows', () => {
    render(
      <WorkspaceSpaceCard
        active
        density="compact"
        workspace={workspace}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onOpen={vi.fn()}
      />,
    )

    const surface = screen
      .getByRole('button', { name: 'Open Independent Study' })
      .closest('.relative')

    expect(surface).toHaveClass('rounded-compact')
    expect(surface).toHaveClass(
      'border',
      'border-foreground/20',
      'bg-card',
      'shadow-none',
    )
    expect(surface).not.toHaveClass('bg-muted/35')
    expect(surface).not.toHaveClass('border-2', 'border-primary')
    expect(surface).not.toHaveClass('ring-1', 'ring-inset', 'ring-border/70')
    expect(screen.getByText('Independent Study')).toHaveClass('line-clamp-2', 'type-row-title')
    expect(screen.getByText('Active')).toHaveClass('border-border', 'bg-card', 'text-muted-foreground')
    expect(screen.getByText('Active')).not.toHaveClass('bg-primary', 'text-primary-foreground')
    expect(screen.getByText('Reading notes, review decks, and reference material for ongoing study.')).toHaveClass(
      'line-clamp-2',
    )
  })

  it('keeps the action frame stable while opening a workspace', () => {
    render(
      <WorkspaceSpaceCard
        active={false}
        opening
        workspace={{ ...workspace, title: 'Reading Archive' }}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onOpen={vi.fn()}
      />,
    )

    const actionFrame = document.querySelector('[data-slot="workspace-card-action-frame"]')
    const spinner = screen.getByRole('status', { name: 'Opening Reading Archive' })

    expect(actionFrame).toHaveClass('size-11', 'bg-muted', 'text-muted-foreground')
    expect(spinner).toHaveAttribute('data-slot', 'pending-spinner')
    expect(spinner).toHaveClass('size-4')
  })
})
