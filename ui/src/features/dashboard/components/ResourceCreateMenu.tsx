import { useId } from 'react'

import { FolderPlus, Layers3, Plus } from 'lucide-react'

import { Button } from '@shared/components/ui/button'
import { responsiveActionButtonClassName } from '@shared/components/ui/responsive-action'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  dropdownMenuItemClassName,
} from '@shared/components/ui/dropdown-menu'

export const ResourceCreateMenu = ({
  label = 'Create',
  onCreateDeck,
  onCreateFolder,
  variant = 'default',
}: {
  label?: string
  onCreateDeck: () => void
  onCreateFolder: () => void
  variant?: 'default' | 'responsive'
}) => {
  const labelId = useId()
  const responsive = variant === 'responsive'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={responsive ? label : undefined}
          className={
            responsive
              ? `${responsiveActionButtonClassName} bg-primary text-primary-foreground hover:bg-primary/90`
              : 'h-11 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-primary/90'
          }
          type="button"
          variant="default"
        >
          <Plus className="size-4" />
          {responsive ? null : label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        aria-labelledby={labelId}
        className="max-w-[calc(100vw-2rem)] min-w-[13rem] rounded-compact border border-border bg-popover p-2 shadow-floating"
        sideOffset={8}
      >
        <DropdownMenuLabel
          className="type-label px-3 pb-2 pt-2 uppercase text-muted-foreground"
          id={labelId}
        >
          New Item
        </DropdownMenuLabel>
        <DropdownMenuItem
          className={dropdownMenuItemClassName()}
          onSelect={onCreateDeck}
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
            <Layers3 className="size-4" />
          </span>
          <span className="line-clamp-2 text-wrap-anywhere type-row-title min-w-0 flex-1">
            Deck
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className={dropdownMenuItemClassName()}
          onSelect={onCreateFolder}
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
            <FolderPlus className="size-4" />
          </span>
          <span className="line-clamp-2 text-wrap-anywhere type-row-title min-w-0 flex-1">
            Folder
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
