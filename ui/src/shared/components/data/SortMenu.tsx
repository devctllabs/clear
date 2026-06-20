import { useEffect, useState } from 'react'
import { ArrowUpDown, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  dropdownMenuItemClassName,
} from '@shared/components/ui/dropdown-menu'
import {
  type SortDirection,
  type SortPreference,
} from '@shared/types/sort.types'

export type SortFieldOption<TField extends string> = Readonly<{
  field: TField
  label: string
}>

export interface SortMenuProps<TField extends string> {
  ariaLabel: string
  fieldOptions: readonly SortFieldOption<TField>[]
  onDirectionChange: (direction: SortDirection) => void
  onFieldChange: (field: TField) => void
  sort: SortPreference<TField>
}

export const usePersistedSort = <TField extends string>(
  storageKey: string,
  initial: SortPreference<TField>,
  validFields: readonly TField[],
) => {
  const [sort, setSort] = useState<SortPreference<TField>>(() => {
    if (typeof window === 'undefined') {
      return initial
    }

    try {
      const parsed = JSON.parse(window.localStorage.getItem(storageKey) ?? 'null') as
        | Partial<SortPreference<TField>>
        | null

      const parsedField = parsed?.field

      return {
        direction: parsed?.direction === 'desc' ? 'desc' : initial.direction,
        field:
          parsedField && validFields.includes(parsedField) ? parsedField : initial.field,
      }
    } catch {
      return initial
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(storageKey, JSON.stringify(sort))
  }, [sort, storageKey])

  return [sort, setSort] as const
}

export const SortMenu = <TField extends string>({
  ariaLabel,
  fieldOptions,
  onDirectionChange,
  onFieldChange,
  sort,
}: SortMenuProps<TField>) => {
  const { t } = useTranslation()
  const directionLabels: Record<SortDirection, string> = {
    asc: t(($) => $.common.sort.ascending),
    desc: t(($) => $.common.sort.descending),
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={ariaLabel}
          className="type-label inline-flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 uppercase text-muted-foreground transition-colors hover:text-primary focus-visible:bg-background focus-visible:text-primary focus-visible:hover:bg-background"
          type="button"
        >
          <ArrowUpDown className="size-3.5" />
          <span>{t(($) => $.common.sort.sort)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="max-w-[calc(100vw-2rem)] min-w-[12rem] rounded-compact border border-border bg-popover p-2 shadow-floating"
        sideOffset={8}
      >
        <DropdownMenuLabel className="type-label px-3 pb-2 pt-2 uppercase text-muted-foreground">
          {t(($) => $.common.sort.column)}
        </DropdownMenuLabel>
        {fieldOptions.map((option) => (
          <DropdownMenuItem
            className={dropdownMenuItemClassName({ active: sort.field === option.field })}
            key={option.field}
            onSelect={() => {
              if (option.field !== sort.field) {
                onFieldChange(option.field)
              }
            }}
          >
            <span className="line-clamp-2 text-wrap-anywhere type-row-title min-w-0 flex-1">
              {option.label}
            </span>
            {sort.field === option.field ? <Check className="size-4 shrink-0" /> : null}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="my-2" />
        <DropdownMenuLabel className="type-label px-3 pb-2 pt-2 uppercase text-muted-foreground">
          {t(($) => $.common.sort.direction)}
        </DropdownMenuLabel>
        {(['asc', 'desc'] as const).map((direction) => (
          <DropdownMenuItem
            className={dropdownMenuItemClassName({
              active: sort.direction === direction,
            })}
            key={direction}
            onSelect={() => {
              if (direction !== sort.direction) {
                onDirectionChange(direction)
              }
            }}
          >
            <span className="line-clamp-2 text-wrap-anywhere type-row-title min-w-0 flex-1">
              {directionLabels[direction]}
            </span>
            {sort.direction === direction ? <Check className="size-4 shrink-0" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
