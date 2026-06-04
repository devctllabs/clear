import type { ComponentPropsWithoutRef } from 'react'

import { cn } from '@shared/lib/utils'

export const SkeletonBlock = ({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) => (
  <div className={cn('loading-shimmer rounded-full', className)} {...props} />
)
