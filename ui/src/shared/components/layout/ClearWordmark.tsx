import type { ComponentPropsWithoutRef } from 'react'

import { cn } from '@shared/lib/utils'

const clearWordmarkLetters = ['C', 'l', 'e', 'a', 'r'] as const

export const ClearWordmark = ({
  className,
  ...props
}: Omit<ComponentPropsWithoutRef<'p'>, 'children'>) => (
  <p className={cn('clear-nav-brand-thin__word', className)} {...props}>
    <span className="sr-only">Clear</span>
    {clearWordmarkLetters.map((letter, index) => (
      <span
        aria-hidden="true"
        className="clear-nav-brand-thin__letter"
        key={`${letter}-${index}`}
      >
        {letter}
      </span>
    ))}
  </p>
)
