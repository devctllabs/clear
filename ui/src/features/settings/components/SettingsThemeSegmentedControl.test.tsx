import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { SettingsThemeSegmentedControl } from './SettingsThemeSegmentedControl'

describe('SettingsThemeSegmentedControl', () => {
  it('renders active theme and delegates theme changes', async () => {
    const user = userEvent.setup()
    const onThemeChange = vi.fn()

    render(<SettingsThemeSegmentedControl theme="dark" onThemeChange={onThemeChange} />)

    expect(screen.getByRole('group', { name: 'Theme' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Dark' })).toHaveClass(
      'bg-primary',
      'muted-focus-ring',
    )
    expect(screen.getByRole('button', { name: 'Dark' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'System' })).toHaveClass(
      'bg-muted',
      'muted-focus-ring',
      'focus-visible:hover:bg-muted',
    )
    expect(screen.getByRole('button', { name: 'System' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )

    await user.click(screen.getByRole('button', { name: 'System' }))
    expect(onThemeChange).toHaveBeenCalledWith('system')
  })
})
