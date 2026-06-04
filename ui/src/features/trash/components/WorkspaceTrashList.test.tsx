import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { TrashItem } from '../types/trash.types'
import { WorkspaceTrashList } from './WorkspaceTrashList'

const items: TrashItem[] = [
  {
    deletedAt: '2026-04-24T12:00:00.000Z',
    id: 'deleted-deck',
    kind: 'deck',
    locationPath: ['Independent Study', 'Reading Notes'],
    title: 'World History',
  },
  {
    deletedAt: '2026-04-25T12:00:00.000Z',
    id: 'deleted-note',
    kind: 'note',
    locationPath: ['Independent Study', 'Reading Notes', 'World History'],
    title: 'Sampling Error Notes',
  },
]

describe('WorkspaceTrashList', () => {
  it('renders trash items and delegates row actions', async () => {
    const user = userEvent.setup()
    const onDeleteRequest = vi.fn()
    const onRestore = vi.fn()

    render(
      <WorkspaceTrashList
        items={items}
        onDeleteRequest={onDeleteRequest}
        onRestore={onRestore}
      />,
    )

    expect(screen.getByText('World History')).toBeInTheDocument()
    expect(
      screen.getByTitle('Original location: Independent Study / Reading Notes'),
    ).toHaveTextContent('Original location: Independent Study / Reading Notes')
    expect(
      screen.getByTitle('Original location: Independent Study / Reading Notes / World History'),
    ).toHaveTextContent('Original location: ... / Reading Notes / World History')
    expect(screen.getByText('Deck')).toBeInTheDocument()
    expect(screen.getByText('Sampling Error Notes')).toBeInTheDocument()
    expect(screen.getByText('Note')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'World History trash actions' })).toHaveClass(
      'size-11',
    )

    await user.click(screen.getByRole('button', { name: 'World History trash actions' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Restore' }))
    expect(onRestore).toHaveBeenCalledWith('deleted-deck')

    await user.click(screen.getByRole('button', { name: 'Sampling Error Notes trash actions' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }))
    expect(onDeleteRequest).toHaveBeenCalledWith(items[1])
  })
})
