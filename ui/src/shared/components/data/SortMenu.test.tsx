import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { SortMenu } from './SortMenu'

const fieldOptions = [
  { field: 'title', label: 'Name' },
  { field: 'updated', label: 'Updated' },
] as const

describe('SortMenu', () => {
  it('uses a rounded trigger focus shape', () => {
    render(
      <SortMenu
        ariaLabel="Sort decks"
        fieldOptions={fieldOptions}
        sort={{ direction: 'asc', field: 'title' }}
        onDirectionChange={vi.fn()}
        onFieldChange={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Sort decks' })).toHaveClass(
      'rounded-full',
      'px-2',
      'py-1',
      'focus-visible:bg-background',
      'focus-visible:hover:bg-background',
    )
  })

  it('renders quiet rounded menu item focus styles', async () => {
    const user = userEvent.setup()

    render(
      <SortMenu
        ariaLabel="Sort decks"
        fieldOptions={fieldOptions}
        sort={{ direction: 'asc', field: 'title' }}
        onDirectionChange={vi.fn()}
        onFieldChange={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Sort decks' }))

    expect(await screen.findByRole('menuitem', { name: 'Name' })).toHaveClass(
      'rounded-[1rem]',
      'focus-visible:outline-none',
      'data-[highlighted]:outline-none',
      'bg-muted',
    )
  })

  it('notifies callers when a sort option changes', async () => {
    const user = userEvent.setup()
    const onFieldChange = vi.fn()
    const onDirectionChange = vi.fn()

    render(
      <SortMenu
        ariaLabel="Sort decks"
        fieldOptions={fieldOptions}
        sort={{ direction: 'asc', field: 'title' }}
        onDirectionChange={onDirectionChange}
        onFieldChange={onFieldChange}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Sort decks' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Updated' }))

    expect(onFieldChange).toHaveBeenCalledWith('updated')

    await user.click(screen.getByRole('button', { name: 'Sort decks' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Desc' }))

    expect(onDirectionChange).toHaveBeenCalledWith('desc')
  })
})
