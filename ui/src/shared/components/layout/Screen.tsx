import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'

import { SkeletonBlock } from '@shared/components/feedback/SkeletonBlock'
import {
  getIconControlClassName,
  IconLink,
} from '@shared/components/ui/icon-button'
import { cn } from '@shared/lib/utils'

import {
  mobileBottomNavContentPaddingClassName,
  mobileLaneClassName,
} from './LayoutLane'

export const AppShell = ({
  className,
  id = 'main-content',
  ...props
}: ComponentPropsWithoutRef<'main'>) => (
  <main
    id={id}
    className={cn('min-h-screen overflow-x-clip bg-background text-foreground', className)}
    {...props}
  />
)

export const ScreenCanvas = ({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) => (
  <div
    className={cn(
      mobileLaneClassName,
      mobileBottomNavContentPaddingClassName,
      'min-w-0 overflow-x-clip px-5 pt-8 sm:px-6 sm:pt-10',
      className,
    )}
    {...props}
  />
)

export const navigationIconControlClassName =
  getIconControlClassName({
    className: 'text-foreground/70',
    size: 'lg',
  })

export const BackControl = ({
  ariaLabel = 'Back',
  fallbackTo,
  icon,
}: {
  ariaLabel?: string
  fallbackTo: string
  icon?: ReactNode
}) => {
  return (
    <IconLink
      className="text-foreground/70"
      icon={icon ?? <ArrowLeft className="size-5" />}
      label={ariaLabel}
      size="lg"
      to={fallbackTo as never}
    />
  )
}

export const PageHeader = ({
  backTo,
  className,
  compactBodyGap = false,
  description,
  reserveDescriptionSpace = false,
  rightSlot,
  title,
}: {
  backTo?: string
  className?: string
  compactBodyGap?: boolean
  description?: string
  reserveDescriptionSpace?: boolean
  rightSlot?: ReactNode
  title: string
}) => (
  <section className={cn('min-w-0', compactBodyGap ? 'mb-4' : 'mb-6', className)}>
    <div
      className={cn(
        'mb-1 flex min-w-0 items-start gap-x-3 gap-y-2',
        backTo && 'items-center',
      )}
    >
      {backTo ? <BackControl fallbackTo={backTo} /> : null}
      <h1 className="text-wrap-anywhere type-mobile-page-title min-w-0 flex-1 text-primary">
        {title}
      </h1>
      {rightSlot ? (
        <div className="ml-auto flex max-w-[45%] shrink-0 items-center justify-end">
          {rightSlot}
        </div>
      ) : null}
    </div>
    {reserveDescriptionSpace || description ? (
      <div className={cn(reserveDescriptionSpace && 'min-h-[3.75rem]')}>
        {description ? (
          <p className="text-wrap-anywhere max-w-copy text-sm font-medium leading-5 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
    ) : null}
  </section>
)

export const PageHeaderSkeleton = ({
  backTo,
  className,
  compactBodyGap = false,
  reserveDescriptionSpace = false,
  rightActionWidths = [],
  titleClassName,
}: {
  backTo?: string
  className?: string
  compactBodyGap?: boolean
  reserveDescriptionSpace?: boolean
  rightActionWidths?: string[]
  titleClassName?: string
}) => (
  <section
    className={cn(compactBodyGap ? 'mb-4' : 'mb-6', className)}
  >
    <div className={cn('mb-1 flex min-w-0 items-center gap-3', !backTo && 'items-start')}>
      {backTo ? <BackControl fallbackTo={backTo} /> : null}
      <SkeletonBlock
        aria-hidden="true"
        className={cn(
          'h-10 min-w-0 flex-1 rounded-compact',
          titleClassName ?? 'max-w-[14rem]',
        )}
      />
      {rightActionWidths.length > 0 ? (
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {rightActionWidths.map((widthClassName, index) => (
            <SkeletonBlock
              aria-hidden="true"
              className={cn('h-10 rounded-full', widthClassName)}
              key={`${widthClassName}-${index}`}
            />
          ))}
        </div>
      ) : null}
    </div>
    {reserveDescriptionSpace ? (
      <div aria-hidden="true" className="min-h-[3.75rem] pt-3">
        <SkeletonBlock className="h-4 w-full max-w-[17rem]" />
        <SkeletonBlock className="mt-2 h-4 w-2/3 max-w-[12rem]" />
      </div>
    ) : null}
  </section>
)

export const SectionHeading = ({ children }: { children: ReactNode }) => (
  <h2 className="text-wrap-anywhere type-label uppercase text-muted-foreground">
    {children}
  </h2>
)
