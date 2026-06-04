import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { StorybookRouterProvider } from '@/test/storybook/router'

import { IconButton, IconLink } from './icon-button'

describe('IconButton', () => {
  it('renders a surface-aware round icon button', () => {
    render(
      <IconButton
        focusSurface="card"
        icon={<span data-testid="icon" />}
        label="Dismiss"
        size="sm"
      />,
    )

    const button = screen.getByRole('button', { name: 'Dismiss' })

    expect(button).toHaveAttribute('type', 'button')
    expect(button).toHaveClass(
      'size-8',
      'rounded-full',
      'card-focus-ring',
      'focus-visible:bg-card',
      'focus-visible:hover:bg-card',
    )
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })
})

describe('IconLink', () => {
  it('renders a surface-aware round icon link', () => {
    render(
      <StorybookRouterProvider>
        <IconLink
          className="text-foreground/70"
          icon={<span data-testid="link-icon" />}
          label="Back"
          size="lg"
          to="/workspaces"
        />
      </StorybookRouterProvider>,
    )

    const link = screen.getByRole('link', { name: 'Back' })

    expect(link).toHaveAttribute('href', '/workspaces')
    expect(link).toHaveClass(
      'size-11',
      'text-foreground/70',
      'focus-visible:bg-background',
      'focus-visible:hover:bg-background',
    )
    expect(screen.getByTestId('link-icon')).toBeInTheDocument()
  })
})
