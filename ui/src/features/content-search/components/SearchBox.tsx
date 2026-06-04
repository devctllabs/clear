import type { ComponentPropsWithoutRef } from 'react'

import {
  SearchBox as SharedSearchBox,
  SearchBoxSkeleton as SharedSearchBoxSkeleton,
} from '@shared/components/forms/SearchBox'
import { cn } from '@shared/lib/utils'

type SearchBoxProps = Omit<
  ComponentPropsWithoutRef<typeof SharedSearchBox>,
  'containerClassName'
> & {
  className?: string
}

export const SearchBox = ({ className, ...props }: SearchBoxProps) => (
  <SharedSearchBox
    containerClassName={cn('group relative mb-4 mt-2 block', className)}
    {...props}
  />
)

export const SearchBoxSkeleton = ({ className }: { className?: string }) => (
  <SharedSearchBoxSkeleton
    containerClassName={cn('group relative mb-4 mt-2 block', className)}
  />
)
