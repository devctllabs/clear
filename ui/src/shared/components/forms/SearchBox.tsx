import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'
import { Search } from 'lucide-react'

import { SkeletonBlock } from '@shared/components/feedback/SkeletonBlock'
import {
  keyboardCardInputFocusClassName,
  keyboardInputFocusClassName,
  keyboardPopoverInputFocusClassName,
  type FocusSurface,
} from '@shared/components/ui/focus'
import { cn } from '@shared/lib/utils'

type SearchBoxSurface = Extract<FocusSurface, 'background' | 'card' | 'popover'>

const searchBoxFocusClassNames: Record<SearchBoxSurface, string> = {
  background: keyboardInputFocusClassName,
  card: keyboardCardInputFocusClassName,
  popover: keyboardPopoverInputFocusClassName,
}

export type SearchBoxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'className' | 'type'
> & {
  containerClassName?: string
  icon?: ReactNode | false
  iconClassName?: string
  inputClassName?: string
  label?: string
  surface?: SearchBoxSurface
  type?: InputHTMLAttributes<HTMLInputElement>['type']
}

export const SearchBox = forwardRef<HTMLInputElement, SearchBoxProps>(({
  autoComplete = 'off',
  containerClassName,
  icon,
  iconClassName,
  inputClassName,
  label = 'Search',
  name = 'search',
  surface = 'background',
  type = 'search',
  ...props
}, ref) => {
  const resolvedIcon = icon === undefined ? <Search className="size-5" /> : icon
  const hasIcon = resolvedIcon !== false
  const { 'aria-label': ariaLabel, ...inputProps } = props

  return (
    <label className={cn('relative block', containerClassName)}>
      {hasIcon ? (
        <span
          className={cn(
            'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5 text-muted-foreground/70',
            iconClassName,
          )}
        >
          {resolvedIcon}
        </span>
      ) : null}
      <input
        ref={ref}
        aria-label={ariaLabel ?? label}
        autoComplete={autoComplete}
        className={cn(
          'block min-w-0 w-full truncate rounded-full border border-border bg-input text-base font-medium text-foreground transition-colors placeholder:text-muted-foreground/70 focus:bg-input sm:text-sm',
          hasIcon ? 'py-4 pl-14 pr-6' : 'px-4 py-3',
          searchBoxFocusClassNames[surface],
          inputClassName,
        )}
        name={name}
        type={type}
        {...inputProps}
      />
    </label>
  )
})

SearchBox.displayName = 'SearchBox'

export type SearchBoxSkeletonProps = {
  containerClassName?: string
  icon?: boolean
  inputClassName?: string
  placeholderClassName?: string
}

export const SearchBoxSkeleton = ({
  containerClassName,
  icon = true,
  inputClassName,
  placeholderClassName,
}: SearchBoxSkeletonProps) => (
  <div
    aria-hidden="true"
    className={cn('relative block', containerClassName)}
  >
    <div
      className={cn(
        'flex min-h-[3.25rem] min-w-0 items-center gap-3 rounded-full border border-border bg-input py-4 pr-6',
        icon ? 'pl-5' : 'pl-6',
        inputClassName,
      )}
    >
      {icon ? <SkeletonBlock className="size-5 shrink-0" /> : null}
      <SkeletonBlock
        className={cn('h-3.5 w-full max-w-[12rem]', placeholderClassName)}
      />
    </div>
  </div>
)
