import { Link } from '@tanstack/react-router'
import { Grid2X2, Home, Settings2, Trash2 } from 'lucide-react'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { SkeletonBlock } from '@shared/components/feedback/SkeletonBlock'
import { Card } from '@shared/components/ui/card'
import type { NavigationTarget } from '@shared/components/layout/BottomNav'
import { cardFocusRingClassName } from '@shared/components/ui/focus'
import { cn } from '@shared/lib/utils'

import { ClearWordmark } from './ClearWordmark'
import { BackControl } from './Screen'

export type DesktopNavItem = 'conflicts' | 'home' | 'settings' | 'spaces' | 'trash'

export const desktopDetailContentClassName =
  'desktop-detail-content mx-auto w-full max-w-page'
export const desktopDetailGridClassName =
  'desktop-detail-grid grid min-w-0 gap-8 grid-cols-[minmax(0,1fr)_minmax(14rem,20rem)] xl:grid-cols-[minmax(0,1fr)_minmax(14rem,22rem)]'

export const DesktopAppShell = ({
  activeItem = 'home',
  children,
  homeTarget,
}: {
  activeItem?: DesktopNavItem
  children: ReactNode
  homeTarget: NavigationTarget
}) => (
  <main id="main-content" className="min-h-screen bg-background text-foreground">
    <div className="grid min-h-screen grid-cols-[var(--desktop-sidebar-width)_minmax(0,1fr)]">
      <DesktopSidebar activeItem={activeItem} homeTarget={homeTarget} />
      <div className="min-w-0">{children}</div>
    </div>
  </main>
)

export const DesktopContentFrame = ({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) => (
  <div
    className={cn('mx-auto w-full max-w-app min-w-0 overflow-x-hidden px-8 py-8 xl:px-10', className)}
    {...props}
  />
)

export const DesktopPageLayout = ({
  activeItem = 'home',
  children,
  contentClassName,
  frameClassName,
  homeTarget,
}: {
  activeItem?: DesktopNavItem
  children?: ReactNode
  contentClassName?: string
  frameClassName?: string
  homeTarget: NavigationTarget
}) => (
  <DesktopAppShell activeItem={activeItem} homeTarget={homeTarget}>
    <DesktopContentFrame className={frameClassName}>
      <div className={contentClassName ?? 'mx-auto w-full max-w-page'}>
        {children}
      </div>
    </DesktopContentFrame>
  </DesktopAppShell>
)

export const DesktopPageHeader = ({
  backTo,
  compactBodyGap = false,
  description,
  eyebrow,
  reserveDescriptionSpace = false,
  rightSlot,
  searchSlot,
  title,
}: {
  backTo?: string
  compactBodyGap?: boolean
  description?: string
  eyebrow?: string
  reserveDescriptionSpace?: boolean
  rightSlot?: ReactNode
  searchSlot?: ReactNode
  title: string
}) => (
  <header className={cn('min-w-0', compactBodyGap ? 'mb-4 pb-4' : 'mb-8 pb-6')}>
    <div className="flex min-w-0 items-start justify-between gap-6">
      <div className="flex min-w-0 flex-1 items-start gap-4">
        {backTo ? (
          <BackControl fallbackTo={backTo} />
        ) : null}
        <div className="min-w-0 flex-1">
          {eyebrow ? (
            <p className="type-label mb-2 uppercase text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-wrap-anywhere type-page-title text-foreground">
            {title}
          </h1>
          {description || reserveDescriptionSpace ? (
            <div
              aria-hidden={description ? undefined : true}
              className={cn(
                'mt-3 max-w-copy',
                reserveDescriptionSpace && 'min-h-[3rem]',
              )}
            >
              {description ? (
                <p className="text-wrap-anywhere text-sm font-medium leading-6 text-muted-foreground">
                  {description}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
      {rightSlot ? (
        <div className="mt-1 flex min-h-11 max-w-[42%] shrink-0 flex-wrap items-center justify-end gap-3">
          {rightSlot}
        </div>
      ) : null}
    </div>
    {searchSlot ? <div className="mt-8 w-full max-w-section">{searchSlot}</div> : null}
  </header>
)

export const DesktopPageHeaderSkeleton = ({
  backTo,
  compactBodyGap = false,
  reserveDescriptionSpace = false,
  rightActionWidths = [],
  search = false,
  showEyebrow = false,
  titleClassName,
}: {
  backTo?: string
  compactBodyGap?: boolean
  reserveDescriptionSpace?: boolean
  rightActionWidths?: string[]
  search?: boolean
  showEyebrow?: boolean
  titleClassName?: string
}) => (
  <header className={cn(compactBodyGap ? 'mb-4 pb-4' : 'mb-8 pb-6')}>
    <div className="flex min-w-0 items-start justify-between gap-6">
      <div className="flex min-w-0 flex-1 items-start gap-4">
        {backTo ? (
          <BackControl fallbackTo={backTo} />
        ) : null}
        <div aria-hidden="true" className="min-w-0 flex-1">
          {showEyebrow ? <SkeletonBlock className="mb-2 h-3 w-24" /> : null}
          <SkeletonBlock
            className={cn(
              'h-11 max-w-full rounded-[1.375rem]',
              titleClassName ?? 'w-72',
            )}
          />
          {reserveDescriptionSpace ? (
            <div className="mt-3 min-h-[3rem] max-w-2xl space-y-2">
              <SkeletonBlock className="h-4 w-full max-w-[28rem]" />
              <SkeletonBlock className="h-4 w-2/3 max-w-[18rem]" />
            </div>
          ) : null}
        </div>
      </div>
      {rightActionWidths.length > 0 ? (
        <div aria-hidden="true" className="mt-1 flex shrink-0 items-center gap-3">
          {rightActionWidths.map((widthClassName, index) => (
            <SkeletonBlock
              className={cn('h-11 rounded-full', widthClassName)}
              key={`${widthClassName}-${index}`}
            />
          ))}
        </div>
      ) : null}
    </div>
    {search ? (
      <div aria-hidden="true" className="mt-8 max-w-section">
        <div className="flex min-h-[3.25rem] min-w-0 items-center gap-3 rounded-full border border-border bg-input py-4 pl-5 pr-6">
          <SkeletonBlock className="size-5 shrink-0" />
          <SkeletonBlock className="h-3.5 w-full max-w-[12rem]" />
        </div>
      </div>
    ) : null}
  </header>
)

export const DesktopAsidePanel = ({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof Card>) => (
  <Card
    className={cn('rounded-card border border-border bg-card p-6 shadow-card', className)}
    {...props}
  />
)

const DesktopSidebar = ({
  activeItem,
  homeTarget,
}: {
  activeItem: DesktopNavItem
  homeTarget: NavigationTarget
}) => {
  const { t } = useTranslation()
  const navItems: Array<{
    icon: ReactNode
    id: DesktopNavItem
    label: string
    target: NavigationTarget
  }> = [
    {
      icon: <Home className="size-5" />,
      id: 'home',
      label: t(($) => $.navigation.items.home),
      target: homeTarget,
    },
    {
      icon: <Grid2X2 className="size-5" />,
      id: 'spaces',
      label: t(($) => $.navigation.items.workspaces),
      target: { to: '/workspaces' },
    },
    {
      icon: <Settings2 className="size-5" />,
      id: 'settings',
      label: t(($) => $.navigation.items.settings),
      target: { to: '/menu/settings' },
    },
    {
      icon: <Trash2 className="size-5" />,
      id: 'trash',
      label: t(($) => $.navigation.items.trash),
      target: { to: '/menu/trash' },
    },
  ]

  return (
    <div className="sticky top-0 flex h-screen min-h-screen min-w-0 flex-col border-r border-border bg-card/80 px-4 py-5 backdrop-blur-md">
      <div className="clear-nav-brand-thin">
        <ClearWordmark />
      </div>
      <nav aria-label={t(($) => $.navigation.items.primary)} className="space-y-1">
        {navItems.map((item) => {
          const active = item.id === activeItem

          return (
            <Link
              aria-current={active ? 'page' : undefined}
              className={cn(
                'type-action flex items-center gap-3 rounded-full px-4 py-3 transition-colors',
                cardFocusRingClassName,
                active
                  ? 'bg-primary text-primary-foreground focus-visible:bg-primary focus-visible:text-primary-foreground focus-visible:hover:bg-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:bg-card focus-visible:text-foreground focus-visible:hover:bg-card',
              )}
              key={item.id}
              search={item.target.search as never}
              to={item.target.to as never}
            >
              {item.icon}
              <span className="min-w-0">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
