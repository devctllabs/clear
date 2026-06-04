import { Ellipsis, Grid2X2, Home } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { cardFocusRingClassName } from '@shared/components/ui/focus'
import { useVisualViewportBottomOffset } from '@shared/hooks/useVisualViewportBottomOffset'
import { cn } from '@shared/lib/utils'

import { mobileLaneWidthClassName } from './LayoutLane'

export type NavigationTarget = {
  search?: Record<string, unknown>
  to: string
}

export const BottomNav = ({
  activeItem = 'home',
  homeTarget,
}: {
  activeItem?: 'home' | 'menu' | 'spaces'
  homeTarget: NavigationTarget
}) => {
  useVisualViewportBottomOffset()

  return (
    <nav className="fixed bottom-[var(--visual-viewport-bottom-offset,0px)] left-0 right-0 z-50 w-full border-t border-border bg-card/95 backdrop-blur-md">
      <div
        className={cn(
          'mx-auto flex items-center justify-between px-7 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3',
          mobileLaneWidthClassName,
        )}
      >
        <BottomNavItem
          active={activeItem === 'home'}
          icon={<Home className="size-5 fill-current" />}
          label="Home"
          target={homeTarget}
        />
        <BottomNavItem
          active={activeItem === 'spaces'}
          icon={<Grid2X2 className="size-5" />}
          label="Spaces"
          target={{ to: '/workspaces' }}
        />
        <BottomNavItem
          active={activeItem === 'menu'}
          icon={<Ellipsis className="size-5" />}
          label="Menu"
          target={{ to: '/menu' }}
        />
      </div>
    </nav>
  )
}

const BottomNavItem = ({
  active = false,
  icon,
  label,
  target,
}: {
  active?: boolean
  icon: ReactNode
  label: string
  target: NavigationTarget
}) => (
  <Link
    aria-label={label}
    className={cn(
      '-mx-3 -my-2 flex min-h-14 min-w-16 flex-col items-center justify-center gap-1 rounded-[1.125rem] px-3 py-2 transition-[background-color,color,transform] active:scale-[0.98] focus-visible:bg-card focus-visible:hover:bg-card',
      cardFocusRingClassName,
      active
        ? 'bg-muted text-foreground'
        : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
    )}
    search={target.search as never}
    to={target.to as never}
  >
    <span>{icon}</span>
    <span className="type-label uppercase">
      {label}
    </span>
  </Link>
)
