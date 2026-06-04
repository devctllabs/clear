import type { InputHTMLAttributes } from 'react'

import { SearchBox, SearchBoxSkeleton } from './SearchBox'

export const StickySearch = (props: InputHTMLAttributes<HTMLInputElement>) => (
  <div className="sticky top-0 z-30 -mx-6 bg-background/95 px-6 py-4 backdrop-blur-md">
    <SearchBox className="mb-2 mt-2" {...props} />
  </div>
)

export const StickySearchSkeleton = () => (
  <div
    aria-hidden="true"
    className="sticky top-0 z-30 -mx-6 bg-background/95 px-6 py-4 backdrop-blur-md"
  >
    <SearchBoxSkeleton className="mb-2 mt-2" />
  </div>
)
