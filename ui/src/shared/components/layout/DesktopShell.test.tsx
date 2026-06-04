import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { StorybookRouterProvider } from '@/test/storybook/router'

import {
  DesktopPageHeader,
  DesktopPageHeaderSkeleton,
  DesktopPageLayout,
} from './DesktopShell'
import { Button } from '../ui/button'

const findDescriptionSlot = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('div')).find((element) =>
    element.classList.contains('min-h-[3rem]'),
  )

describe('DesktopPageHeader', () => {
  it('keeps desktop header spacing without a divider', () => {
    const { container } = render(<DesktopPageHeader title="World History" />)
    const header = container.querySelector('header')

    expect(header).toHaveClass('mb-8', 'pb-6')
    expect(header).not.toHaveClass('border-b')
    expect(header).not.toHaveClass('border-border')
  })

  it('supports compact spacing before the page body', () => {
    const { container } = render(
      <DesktopPageHeader compactBodyGap title="World History" />,
    )
    const header = container.querySelector('header')

    expect(header).toHaveClass('mb-4', 'pb-4')
    expect(header).not.toHaveClass('mb-8')
    expect(header).not.toHaveClass('pb-6')
  })

  it('reserves description space when requested without copy', () => {
    const { container } = render(
      <DesktopPageHeader reserveDescriptionSpace title="World History" />,
    )

    expect(screen.getByRole('heading', { name: 'World History' })).toBeInTheDocument()
    expect(findDescriptionSlot(container)).toBeInTheDocument()
  })

  it('keeps desktop descriptions on a narrow reading measure', () => {
    const { container } = render(
      <DesktopPageHeader
        description="A longer header description that should wrap before it spans the full content lane."
        title="World History"
      />,
    )
    const description = screen.getByText(
      'A longer header description that should wrap before it spans the full content lane.',
    )

    expect(description.parentElement).toHaveClass('max-w-copy')
    expect(container.querySelector('[class*="max-w-2xl"]')).toBeNull()
  })

  it('keeps description space opt-in', () => {
    const { container } = render(<DesktopPageHeader title="World History" />)

    expect(findDescriptionSlot(container)).toBeUndefined()
  })

  it('places desktop search with the detail page rhythm', () => {
    render(
      <DesktopPageHeader
        searchSlot={<div data-testid="search-slot" />}
        title="World History"
      />,
    )

    const searchSlot = screen.getByTestId('search-slot')

    expect(searchSlot.parentElement).toHaveClass('mt-8', 'w-full', 'max-w-section')
    expect(searchSlot.parentElement).not.toHaveClass('mt-6')
  })

  it('uses a quiet desktop back control', () => {
    render(
      <StorybookRouterProvider>
        <DesktopPageHeader backTo="/workspaces" title="World History" />
      </StorybookRouterProvider>,
    )

    const back = screen.getByRole('link', { name: 'Back' })

    expect(back).toHaveAttribute('href', '/workspaces')
    expect(back).toHaveClass('text-foreground/70', 'hover:bg-muted')
    expect(back).not.toHaveClass('mt-1', 'mt-0.5', 'bg-card', 'border-border', 'ring-border')
  })

  it('aligns right slot actions with the desktop header controls', () => {
    render(
      <DesktopPageHeader
        rightSlot={<Button type="button">Create</Button>}
        title="World History"
      />,
    )

    const create = screen.getByRole('button', { name: 'Create' })

    expect(create.parentElement).toHaveClass(
      'mt-1',
      'flex',
      'min-h-11',
      'max-w-[42%]',
      'flex-wrap',
      'items-center',
      'gap-3',
    )
  })

  it('mirrors desktop header spacing for loading placeholders', () => {
    const { container } = render(
      <StorybookRouterProvider>
        <DesktopPageHeaderSkeleton
          backTo="/workspaces"
          reserveDescriptionSpace
          rightActionWidths={['w-28', 'w-11']}
          search
          showEyebrow
        />
      </StorybookRouterProvider>,
    )
    const header = container.querySelector('header')

    expect(header).toHaveClass('mb-8', 'pb-6')
    const back = screen.getByRole('link', { name: 'Back' })

    expect(back).toHaveAttribute('href', '/workspaces')
    expect(back).not.toHaveClass('mt-1')
    expect(findDescriptionSlot(container)).toBeInTheDocument()
    expect(container.querySelector('[class*="max-w-section"]')).toHaveClass(
      'mt-8',
      'max-w-section',
    )
    expect(container.querySelector('[class*="w-28"]')?.parentElement).toHaveClass('mt-1')
  })
})

describe('DesktopPageLayout', () => {
  it('combines the desktop sidebar, centered frame, and default content lane', () => {
    const { container } = render(
      <StorybookRouterProvider>
        <DesktopPageLayout
          activeItem="spaces"
          frameClassName="test-frame-class"
          homeTarget={{ to: '/workspaces' }}
        >
          <h1>Layout Content</h1>
        </DesktopPageLayout>
      </StorybookRouterProvider>,
    )

    expect(screen.getByRole('link', { name: 'Workspaces' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', { name: 'Workspaces' })).toHaveClass(
      'card-focus-ring',
      'focus-visible:bg-primary',
      'focus-visible:hover:bg-primary',
    )
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/workspaces')
    expect(screen.getByRole('link', { name: 'Home' })).toHaveClass(
      'card-focus-ring',
      'focus-visible:bg-card',
      'focus-visible:hover:bg-card',
    )
    expect(screen.getByRole('link', { name: 'Workspaces' })).toHaveAttribute('href', '/workspaces')
    expect(screen.queryByRole('link', { name: 'Conflicts' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute(
      'href',
      '/menu/settings',
    )
    expect(screen.getByRole('link', { name: 'Trash' })).toHaveAttribute(
      'href',
      '/menu/trash',
    )
    expect(screen.queryByRole('link', { name: 'Menu' })).not.toBeInTheDocument()
    const heading = screen.getByRole('heading', { name: 'Layout Content' })
    expect(heading).toBeInTheDocument()
    expect(heading.parentElement).toHaveClass('mx-auto', 'w-full', 'max-w-page')
    expect(container.querySelector('.test-frame-class')).toHaveClass(
      'mx-auto',
      'max-w-app',
      'px-8',
      'py-8',
    )
  })

  it('supports full-width content overrides inside the desktop frame', () => {
    render(
      <StorybookRouterProvider>
        <DesktopPageLayout
          contentClassName="w-full"
          homeTarget={{ to: '/dashboard/independent-study' }}
        >
          <h1>Wide Content</h1>
        </DesktopPageLayout>
      </StorybookRouterProvider>,
    )

    expect(screen.getByRole('heading', { name: 'Wide Content' }).parentElement).toHaveClass(
      'w-full',
    )
    expect(screen.getByRole('heading', { name: 'Wide Content' }).parentElement).not.toHaveClass(
      'max-w-page',
    )
  })
})
