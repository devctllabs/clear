import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { StorybookRouterProvider } from '@/test/storybook/router'
import { mockMatchMedia } from '@/test/matchMedia'
import { AppRuntimeProfileProvider } from '@shared/hooks/useAppLayoutMode'

import { NoteEditorLoadingState } from './NoteEditorLoadingState'

describe('NoteEditorLoadingState', () => {
  it('renders the basic note editor skeleton as a single editor card', () => {
    mockMatchMedia(true)

    const { container } = render(
      <StorybookRouterProvider>
        <NoteEditorLoadingState
          activeKind="basic"
          backTo="/dashboard/independent-study/decks/world-history"
          title="New Note"
        />
      </StorybookRouterProvider>,
    )

    const status = screen.getByRole('status', { name: 'Loading note editor' })

    expect(status.querySelector('[class*="shadow-card"]')).not.toBeNull()
    expect(container.querySelectorAll('hr')).toHaveLength(2)
    expect(container.querySelectorAll('[class*="size-10"]')).not.toHaveLength(0)
  })

  it('renders cloze note loading with the help card structure', () => {
    mockMatchMedia(true)

    const { container } = render(
      <StorybookRouterProvider>
        <NoteEditorLoadingState
          activeKind="cloze"
          backTo="/dashboard/independent-study/decks/world-history"
          title="New Note"
        />
      </StorybookRouterProvider>,
    )

    expect(screen.getByRole('status', { name: 'Loading note editor' })).toBeInTheDocument()
    expect(container.querySelectorAll('[class*="shadow-card"]')).toHaveLength(2)
  })

  it('matches the mobile footer action skeleton height to the loaded action', () => {
    const { container } = render(
      <StorybookRouterProvider>
        <AppRuntimeProfileProvider initialProfile={{ formFactor: 'mobile', runtime: 'web' }}>
          <NoteEditorLoadingState
            activeKind="basic"
            backTo="/dashboard/independent-study/decks/world-history"
            title="New Note"
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
