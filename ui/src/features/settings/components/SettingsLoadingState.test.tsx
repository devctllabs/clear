import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SettingsLoadingState } from './SettingsLoadingState'

describe('SettingsLoadingState', () => {
  it('renders settings sections as a polite loading region', () => {
    const { container } = render(<SettingsLoadingState />)

    const status = screen.getByRole('status', { name: 'Loading settings' })

    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(status.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
    expect(screen.getByText('General')).toBeInTheDocument()
    expect(screen.getByText('Appearance')).toBeInTheDocument()
    expect(screen.getByText('Study')).toBeInTheDocument()
    expect(screen.getByText('Schedule')).toBeInTheDocument()
    expect(status.querySelectorAll('section')).toHaveLength(4)
    expect(container.querySelectorAll('[class*="shadow-card"]')).toHaveLength(4)
  })
})
