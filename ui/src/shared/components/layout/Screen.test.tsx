import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { StorybookRouterProvider } from '@/test/storybook/router'

import { AppShell, BackControl, PageHeader, ScreenCanvas } from './Screen'

describe('AppShell', () => {
  it('clips horizontal overflow without creating a sticky scroll container', () => {
    render(
      <AppShell>
        <h1>App content</h1>
      </AppShell>,
    )

    const shell = screen.getByRole('main')

    expect(shell).toHaveClass('overflow-x-clip')
    expect(shell).not.toHaveClass('overflow-x-hidden')
  })
})

describe('BackControl', () => {
  it('uses a quiet transparent navigation style', () => {
    render(
      <StorybookRouterProvider>
        <BackControl fallbackTo="/workspaces" />
      </StorybookRouterProvider>,
    )

    const back = screen.getByRole('link', { name: 'Back' })

    expect(back).toHaveAttribute('href', '/workspaces')
    expect(back).toHaveClass(
      'size-11',
      'text-foreground/70',
      'hover:bg-muted',
      'focus-visible:bg-background',
      'focus-visible:hover:bg-background',
    )
    expect(back).not.toHaveClass('bg-card', 'border-border', 'ring-border')
    expect(back.querySelector('svg')).toHaveClass('size-5')
  })
})

describe('ScreenCanvas', () => {
  it('uses the responsive mobile content lane', () => {
    render(
      <ScreenCanvas>
        <h1>Mobile content</h1>
      </ScreenCanvas>,
    )

    expect(screen.getByRole('heading', { name: 'Mobile content' }).parentElement).toHaveClass(
      'mx-auto',
      'w-full',
      'max-w-mobile',
      'sm:max-w-mobile-wide',
      'md:max-w-mobile-expanded',
      'pb-[calc(7rem+env(safe-area-inset-bottom)+var(--visual-viewport-bottom-offset,0px))]',
    )
  })

  it('clips horizontal overflow without breaking sticky children', () => {
    render(
      <ScreenCanvas>
        <h1>Mobile content</h1>
      </ScreenCanvas>,
    )

    const canvas = screen.getByRole('heading', { name: 'Mobile content' }).parentElement

    expect(canvas).toHaveClass('overflow-x-clip')
    expect(canvas).not.toHaveClass('overflow-x-hidden')
  })
})

describe('PageHeader', () => {
  it('uses the default mobile rhythm without reserving empty description space', () => {
    render(<PageHeader description="Organize your study queue." title="Workspace" />)

    const heading = screen.getByRole('heading', { name: 'Workspace' })
    const description = screen.getByText('Organize your study queue.')

    expect(heading.closest('section')).toHaveClass('mb-6')
    expect(description).toHaveClass('max-w-copy')
    expect(description.parentElement).not.toHaveClass('min-h-[3.75rem]')
  })

  it('supports compact spacing without a reserved description lane', () => {
    render(
      <PageHeader
        compactBodyGap
        description="Organize your study queue."
        reserveDescriptionSpace={false}
        title="Workspace"
      />,
    )

    const heading = screen.getByRole('heading', { name: 'Workspace' })
    const description = screen.getByText('Organize your study queue.')

    expect(heading.closest('section')).toHaveClass('mb-4')
    expect(heading.closest('section')).not.toHaveClass('mb-6')
    expect(description.parentElement).not.toHaveClass('min-h-[3.75rem]')
  })

  it('supports targeted rhythm overrides', () => {
    render(<PageHeader className="mb-7" title="Trash" />)

    expect(screen.getByRole('heading', { name: 'Trash' }).closest('section')).toHaveClass(
      'mb-7',
    )
  })

  it('keeps right slot actions constrained beside long mobile titles', () => {
    render(
      <PageHeader
        rightSlot={<button type="button">Action</button>}
        title="A long workspace title"
      />,
    )

    expect(screen.getByRole('button', { name: 'Action' }).parentElement).toHaveClass(
      'max-w-[45%]',
      'justify-end',
    )
  })
})
