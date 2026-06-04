import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { StorybookRouterProvider } from '@/test/storybook/router'
import { mockMatchMedia } from '@/test/matchMedia'
import { AppRuntimeProfileProvider } from '@shared/hooks/useAppLayoutMode'

import { EditorLoadingState } from './EditorLoadingState'

describe('EditorLoadingState', () => {
  it('renders a deck editor skeleton with the desktop form sections', () => {
    mockMatchMedia(true)

    const { container } = render(
      <StorybookRouterProvider>
        <EditorLoadingState
          backTo="/dashboard/independent-study/decks/world-history"
          formKind="deck"
          title="Edit Deck"
        />
      </StorybookRouterProvider>,
    )

    const status = screen.getByRole('status', { name: 'Loading editor' })

    expect(screen.getByRole('link', { name: 'Close editor' })).toHaveAttribute(
      'href',
      '/dashboard/independent-study/decks/world-history',
    )
    expect(status.querySelector('[class*="shadow-card"]')).not.toBeNull()
    expect(container.querySelectorAll('[class*="size-16"]')).toHaveLength(1)
    expect(container.querySelectorAll('[class*="size-12"]')).toHaveLength(7)
  })

  it('keeps folder editor loading focused on title and description sections', () => {
    mockMatchMedia(true)

    const { container } = render(
      <StorybookRouterProvider>
        <EditorLoadingState
          backTo="/dashboard/independent-study/folders/reading-notes"
          formKind="folder"
          title="Edit Folder"
        />
      </StorybookRouterProvider>,
    )

    expect(screen.getByRole('status', { name: 'Loading editor' })).toBeInTheDocument()
    expect(container.querySelectorAll('[class*="size-12"]')).toHaveLength(0)
  })

  it('matches the mobile footer action skeleton height to the loaded action', () => {
    const { container } = render(
      <StorybookRouterProvider>
        <AppRuntimeProfileProvider initialProfile={{ formFactor: 'mobile', runtime: 'web' }}>
          <EditorLoadingState
            backTo="/dashboard/independent-study/folders/reading-notes"
            formKind="folder"
            title="Edit Folder"
          />
        </AppRuntimeProfileProvider>
      </StorybookRouterProvider>,
    )

    const skeleton = container.querySelector('[data-slot="mobile-footer-action-skeleton"]')

    if (!(skeleton instanceof HTMLElement)) {
      throw new Error('Expected the mobile footer action skeleton to render.')
    }

    expect(skeleton).toHaveClass('h-[3.625rem]')
    expect(skeleton).not.toHaveClass('h-[4.25rem]')
  })
})
