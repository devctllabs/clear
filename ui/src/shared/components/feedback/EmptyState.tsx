import type { ReactNode } from 'react'

import { Button, type ButtonProps } from '@shared/components/ui/button'
import { cn } from '@shared/lib/utils'

export type EmptyStateAction = {
  icon?: ReactNode
  label: string
  variant?: ButtonProps['variant']
  onClick: () => void
}

export type EmptyStateDensity = 'default' | 'compact'

export const EmptyState = ({
  actions = [],
  className,
  density = 'default',
  description,
  fill = false,
  icon,
  title,
}: {
  actions?: EmptyStateAction[]
  className?: string
  density?: EmptyStateDensity
  description?: ReactNode
  fill?: boolean
  icon: ReactNode
  title: string
}) => {
  const compact = density === 'compact'

  return (
    <section
      aria-label={title}
      className={cn('w-full min-w-0 max-w-full', fill && 'h-full', className)}
      data-density={density}
    >
      <div
        className={cn(
          'w-full rounded-card border border-border bg-card text-center shadow-card',
          compact ? 'p-6' : 'p-8',
          fill && 'flex h-full flex-col justify-center',
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'mx-auto flex items-center justify-center rounded-full bg-muted text-foreground',
            compact ? 'size-12' : 'size-14',
          )}
        >
          {icon}
        </span>
        <h2
          className={cn(
            'text-wrap-anywhere type-study-title text-foreground',
            compact ? 'mt-5' : 'mt-6',
          )}
        >
          {title}
        </h2>
        {description ? (
          <div
            className={cn(
              'text-wrap-anywhere mx-auto text-sm font-medium leading-6 text-muted-foreground',
              compact ? 'mt-2 max-w-sm' : 'mt-3 max-w-md',
            )}
          >
            {description}
          </div>
        ) : null}
        {actions.length > 0 ? (
          <div
            className={cn(
              'mx-auto flex flex-col gap-3 sm:flex-row sm:justify-center',
              compact ? 'mt-6 max-w-sm' : 'mt-7 max-w-md',
            )}
          >
            {actions.map((action, index) => (
              <Button
                className={cn(
                  'type-action h-auto rounded-full px-5 py-3',
                  compact ? 'min-h-11' : 'min-h-12',
                  actions.length === 1 && 'sm:min-w-44',
                  actions.length > 1 && 'sm:flex-1',
                )}
                key={action.label}
                type="button"
                variant={action.variant ?? (index === 0 ? 'default' : 'outline')}
                onClick={action.onClick}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
