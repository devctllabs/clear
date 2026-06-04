import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { TrashLoadingState } from './TrashLoadingState'

describe('TrashLoadingState', () => {
  it('renders the trash summary and row skeletons as a polite loading region', () => {
    const { container } = render(<TrashLoadingState />)

    const status = screen.getByRole('status', { name: 'Loading trash' })

    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(status.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
    expect(container.querySelectorAll('[class*="shadow-card"]')).toHaveLength(1)
    expect(status.querySelectorAll('[class*="size-11"]')).toHaveLength(3)
    expect(status.querySelectorAll('[class*="border-t"]')).toHaveLength(2)
  })
})
