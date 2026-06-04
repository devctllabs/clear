import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { StorybookRouterProvider } from '@/test/storybook/router'

import { BottomNav } from './BottomNav'

describe('BottomNav', () => {
  it('uses a full-width fixed shell with a responsive mobile content lane', () => {
    render(
      <StorybookRouterProvider>
        <BottomNav activeItem="home" homeTarget={{ to: '/dashboard/independent-study' }} />
      </StorybookRouterProvider>,
    )

    const navigation = screen.getByRole('navigation')
    const navigationLane = navigation.firstElementChild

    expect(navigation).toHaveClass(
      'fixed',
      'bottom-[var(--visual-viewport-bottom-offset,0px)]',
      'left-0',
      'right-0',
      'w-full',
    )
    expect(document.documentElement.style.getPropertyValue('--visual-viewport-bottom-offset')).toBe(
      '0px',
    )
    expect(navigationLane).toHaveClass(
      'mx-auto',
      'w-full',
      'max-w-mobile',
      'sm:max-w-mobile-wide',
      'md:max-w-mobile-expanded',
    )
    expect(screen.getByRole('link', { name: 'Home' })).toHaveClass(
      'card-focus-ring',
      'min-h-14',
      'min-w-16',
      'bg-muted',
      'rounded-[1.125rem]',
      'focus-visible:bg-card',
      'focus-visible:hover:bg-card',
    )
  })
})
