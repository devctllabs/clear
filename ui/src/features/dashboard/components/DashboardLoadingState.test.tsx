import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DashboardLoadingState } from './DashboardLoadingState'

const hasClassToken = (root: ParentNode, className: string) =>
  Array.from(root.querySelectorAll('[class]')).some((element) =>
    element.classList.contains(className),
  )

const hasMobileContentGap = (root: ParentNode) =>
  Array.from(root.querySelectorAll('.grid')).some(
    (element) =>
      element.classList.contains('gap-6') && element.classList.contains('sm:gap-8'),
  )

describe('DashboardLoadingState', () => {
  it('renders the mobile dashboard skeleton as a polite status region', () => {
    const { container } = render(<DashboardLoadingState />)

    const status = screen.getByRole('status', { name: 'Loading dashboard' })
    const header = status.querySelector('section')

    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(status.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
    expect(header).toHaveClass('mb-4')
    expect(header).not.toHaveClass('mb-6')
    expect(hasClassToken(status, 'min-h-[3.75rem]')).toBe(true)
    expect(hasMobileContentGap(status)).toBe(true)
    expect(screen.getByText('Folders')).toBeInTheDocument()
    expect(screen.getByText('Decks')).toBeInTheDocument()
    expect(status.querySelectorAll('section')).toHaveLength(3)
    expect(container.querySelectorAll('[class*="shadow-card"]')).toHaveLength(2)
  })

  it('renders the desktop dashboard skeleton with reserved header actions and search', () => {
    const { container } = render(<DashboardLoadingState variant="desktop" />)

    const status = screen.getByRole('status', { name: 'Loading dashboard' })

    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(status.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
    expect(status.querySelector('[class*="w-80"]')).toBeInTheDocument()
    expect(status.querySelector('[class*="h-[3.25rem]"]')).toBeInTheDocument()
    expect(status.querySelectorAll('section')).toHaveLength(2)
    expect(container.querySelectorAll('[class*="shadow-card"]')).toHaveLength(2)
  })
})
