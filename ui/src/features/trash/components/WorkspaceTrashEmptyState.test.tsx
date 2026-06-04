import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { WorkspaceTrashEmptyState } from './WorkspaceTrashEmptyState'

describe('WorkspaceTrashEmptyState', () => {
  it('renders empty trash messaging', () => {
    render(<WorkspaceTrashEmptyState />)

    expect(screen.getByRole('heading', { name: 'Trash is empty' })).toBeInTheDocument()
    expect(screen.getByText('Items you delete will appear here before permanent removal.')).toBeInTheDocument()
    expect(document.querySelector('.lucide-trash-2')).toHaveClass(
      'size-12',
      'stroke-[1.9]',
      'opacity-45',
    )
  })
})
