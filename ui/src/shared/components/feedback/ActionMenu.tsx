import { useState, type ReactNode } from 'react'

import { Ellipsis } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  dropdownMenuItemClassName,
} from '@shared/components/ui/dropdown-menu'
import { IconButton } from '@shared/components/ui/icon-button'
import type { FocusSurface } from '@shared/components/ui/focus'
import { cn } from '@shared/lib/utils'

export type ActionMenuItem = Readonly<{
  icon?: ReactNode
  label: string
  onSelect: () => void
  tone?: 'default' | 'danger'
}>

export interface ActionMenuProps {
  readonly ariaLabel?: string
  readonly dialogLabel?: string
  readonly items: readonly ActionMenuItem[]
  readonly triggerAriaLabel?: string
  readonly triggerClassName?: string
  readonly triggerFocusSurface?: FocusSurface
  readonly triggerIcon?: ReactNode
}

export const ActionMenu = ({
  ariaLabel,
  dialogLabel,
  items,
  triggerAriaLabel,
  triggerClassName,
  triggerFocusSurface = 'background',
  triggerIcon,
}: ActionMenuProps) => {
  const [open, setOpen] = useState(false)
  const label = triggerAriaLabel ?? ariaLabel ?? 'Open actions'

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
      }}
    >
      <DropdownMenuTrigger asChild>
        <IconButton
          className={cn(
            'hover:bg-accent',
            triggerClassName,
          )}
          focusSurface={triggerFocusSurface}
          icon={triggerIcon ?? <Ellipsis className="size-4.5" />}
          label={label}
          type="button"
          onClick={(event) => {
            event.stopPropagation()
          }}
          size="lg"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        aria-label={dialogLabel ?? label}
        className="max-w-[calc(100vw-2rem)] min-w-[12rem] rounded-compact border border-border bg-popover p-2 shadow-floating"
        sideOffset={8}
        onClick={(event) => {
          event.stopPropagation()
        }}
      >
        {items.map((item) => (
          <DropdownMenuItem
            className={dropdownMenuItemClassName({
              tone: item.tone === 'danger' ? 'danger' : 'default',
            })}
            key={item.label}
            onSelect={(event) => {
              event.stopPropagation()
              item.onSelect()
            }}
          >
            {item.icon ? (
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full',
                  item.tone === 'danger'
                    ? 'bg-destructive/10 text-destructive'
                    : 'bg-muted text-foreground',
                )}
              >
                {item.icon}
              </span>
            ) : null}
            <span className="line-clamp-2 text-wrap-anywhere type-row-title min-w-0 flex-1">
              {item.label}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
