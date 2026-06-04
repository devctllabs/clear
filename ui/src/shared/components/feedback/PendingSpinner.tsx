import type { ComponentPropsWithoutRef } from 'react'
import { Loader2 } from 'lucide-react'

import { cn } from '@shared/lib/utils'

export type PendingSpinnerProps = Omit<ComponentPropsWithoutRef<'span'>, 'children'> & {
  decorative?: boolean
  label?: string
}

export const PendingSpinner = ({
  className,
  decorative = false,
  label = 'Action in progress',
  ...props
}: PendingSpinnerProps) => {
  const accessibilityProps = decorative
    ? ({ 'aria-hidden': true } as const)
    : ({ 'aria-label': label, role: 'status' } as const)

  return (
    <span
      {...accessibilityProps}
      {...props}
      className={cn(
        'inline-flex size-4 shrink-0 items-center justify-center text-current',
        className,
      )}
      data-slot="pending-spinner"
    >
      <Loader2
        aria-hidden="true"
        className="size-full animate-spin stroke-[2.4] motion-reduce:animate-none"
      />
    </span>
  )
}
