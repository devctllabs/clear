import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { WorkspaceListLoadingState } from './WorkspaceListLoadingState'

describe('WorkspaceListLoadingState', () => {
  it('renders workspace cards and header action as a polite loading region', () => {
    const { container } = render(<WorkspaceListLoadingState />)

    const status = screen.getByRole('status', { name: 'Loading workspaces' })

    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(status.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
    expect(status).toHaveClass('min-h-screen')
    expect(status.querySelector('[class*="w-48"]')).toBeInTheDocument()
    expect(status.querySelector('[class*="size-10"]')).toBeInTheDocument()
    expect(status.querySelector('[class*="space-y-3"]')).toBeInTheDocument()
    expect(
      container.querySelectorAll('[class*="rounded-compact"][class*="shadow-card"]'),
    ).toHaveLength(3)
    expect(container.querySelectorAll('[class*="space-y-1.5"]')).toHaveLength(3)
    expect(container.querySelectorAll('[class*="rounded-card"]')).toHaveLength(0)
  })

  it('keeps desktop loading cards on the regular workspace grid', () => {
    const { container } = render(<WorkspaceListLoadingState variant="desktop" />)

    const status = screen.getByRole('status', { name: 'Loading workspaces' })

    expect(status).not.toHaveClass('min-h-screen')
    expect(status.querySelector('.grid')).toHaveClass(
      'grid-cols-1',
      'lg:grid-cols-2',
      'xl:grid-cols-3',
    )
    expect(container.querySelectorAll('[class*="rounded-card"]')).toHaveLength(6)
  })
})
