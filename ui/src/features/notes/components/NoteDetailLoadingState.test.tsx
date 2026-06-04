import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { StorybookRouterProvider } from '@/test/storybook/router'

import { NoteDetailLoadingState } from './NoteDetailLoadingState'

describe('NoteDetailLoadingState', () => {
  it('matches the mobile footer action skeleton height to the loaded edit action', () => {
    const { container } = render(
      <StorybookRouterProvider initialEntry="/dashboard/independent-study/decks/world-history/notes/industrial-revolution-causes">
        <NoteDetailLoadingState
          homeTarget={{
            to: '/dashboard/independent-study/decks/world-history/notes/industrial-revolution-causes',
          }}
        />
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
