import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
  type ReactNode,
} from 'react'
import { Link } from '@tanstack/react-router'

import { cn } from '@shared/lib/utils'

import { Button } from './button'
import { getFocusRingClassName, type FocusSurface } from './focus'

export type IconControlSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

const iconControlSizeClassNames: Record<IconControlSize, string> = {
  '2xl': 'size-14',
  lg: 'size-11',
  md: 'size-9',
  sm: 'size-8',
  xl: 'size-12',
  xs: 'size-7',
}

const iconControlFocusBackgroundClassNames: Record<FocusSurface, string> = {
  background: 'focus-visible:bg-background focus-visible:hover:bg-background',
  card: 'focus-visible:bg-card focus-visible:hover:bg-card',
  muted: 'focus-visible:bg-muted focus-visible:hover:bg-muted',
  popover: 'focus-visible:bg-popover focus-visible:hover:bg-popover',
}

type IconControlClassNameOptions = {
  className?: string
  focusSurface?: FocusSurface
  includeFocusRing?: boolean
  size?: IconControlSize
}

export const getIconControlClassName = ({
  className,
  focusSurface = 'background',
  includeFocusRing = true,
  size = 'md',
}: IconControlClassNameOptions = {}) =>
  cn(
    'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground/70 transition-[background-color,color,transform] hover:bg-muted hover:text-foreground active:scale-[0.98]',
    iconControlSizeClassNames[size],
    iconControlFocusBackgroundClassNames[focusSurface],
    includeFocusRing && getFocusRingClassName(focusSurface),
    className,
  )

type IconControlProps = {
  className?: string
  focusSurface?: FocusSurface
  icon: ReactNode
  label: string
  size?: IconControlSize
}

export type IconButtonProps = Omit<
  ComponentPropsWithoutRef<typeof Button>,
  'aria-label' | 'children' | 'className' | 'focusSurface' | 'size'
> &
  IconControlProps

export const IconButton = forwardRef<ComponentRef<typeof Button>, IconButtonProps>(({
  className,
  focusSurface = 'background',
  icon,
  label,
  size = 'md',
  type = 'button',
  ...props
}, ref) => (
  <Button
    ref={ref}
    aria-label={label}
    className={getIconControlClassName({
      className,
      focusSurface,
      includeFocusRing: false,
      size,
    })}
    focusSurface={focusSurface}
    type={type}
    {...props}
  >
    {icon}
  </Button>
))

IconButton.displayName = 'IconButton'

export type IconLinkProps = Omit<
  ComponentPropsWithoutRef<typeof Link>,
  'aria-label' | 'children' | 'className'
> &
  IconControlProps

export const IconLink = forwardRef<ComponentRef<typeof Link>, IconLinkProps>(({
  className,
  focusSurface = 'background',
  icon,
  label,
  size = 'md',
  ...props
}, ref) => (
  <Link
    ref={ref}
    aria-label={label}
    className={getIconControlClassName({
      className,
      focusSurface,
      size,
    })}
    {...props}
  >
    {icon}
  </Link>
))

IconLink.displayName = 'IconLink'
