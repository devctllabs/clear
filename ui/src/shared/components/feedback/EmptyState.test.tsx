import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Plus } from 'lucide-react'
import { describe, expect, it, vi } from 'vitest'

import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('renders copy and calls actions', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn()

    render(
      <EmptyState
        actions={[
          {
            icon: <Plus className="size-4" />,
            label: 'Create deck',
            onClick: onCreate,
          },
        ]}
        description="Start by creating the first deck."
        icon={<Plus className="size-5" />}
        title="No content yet"
      />,
    )

    expect(screen.getByRole('region', { name: 'No content yet' })).toBeInTheDocument()
    expect(screen.getByText('Start by creating the first deck.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Create deck' }))

    expect(onCreate).toHaveBeenCalledTimes(1)
  })

  it('renders compact density without changing actions', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn()

    render(
      <EmptyState
        actions={[
          {
            label: 'Create note',
            onClick: onCreate,
          },
        ]}
        density="compact"
        description="Create the first note."
        icon={<Plus className="size-5" />}
        title="This deck is empty"
      />,
    )

    expect(screen.getByRole('region', { name: 'This deck is empty' })).toHaveAttribute(
      'data-density',
      'compact',
    )

    await user.click(screen.getByRole('button', { name: 'Create note' }))

    expect(onCreate).toHaveBeenCalledTimes(1)
  })
})
