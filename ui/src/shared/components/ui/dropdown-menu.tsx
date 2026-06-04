import * as React from 'react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { Check, ChevronRight, Circle } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

type DropdownMenuItemTone = 'default' | 'danger' | 'foreground'

type DropdownMenuItemClassNameOptions = {
  active?: boolean
  className?: string
  tone?: DropdownMenuItemTone
}

const dropdownMenuItemToneClassNames: Record<DropdownMenuItemTone, string> = {
  danger:
    'text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive',
  default:
    'text-primary hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary',
  foreground:
    'text-foreground hover:bg-primary/10 hover:text-foreground focus:bg-primary/10 focus:text-foreground data-[highlighted]:bg-primary/10 data-[highlighted]:text-foreground',
}

const dropdownMenuItemClassName = ({
  active = false,
  className,
  tone = 'default',
}: DropdownMenuItemClassNameOptions = {}) =>
  cn(
    'type-action flex items-center gap-3 rounded-[1rem] px-4 py-3 outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 data-[highlighted]:outline-none data-[highlighted]:ring-0',
    active && 'bg-muted',
    dropdownMenuItemToneClassNames[tone],
    className,
  )

type DropdownMenuFocusContextValue = {
  handleCloseAutoFocus: (event: Event) => void
  markKeyboardInteraction: () => void
  markPointerInteraction: () => void
  setTrigger: (node: HTMLElement | null) => void
}

const DropdownMenuFocusContext =
  React.createContext<DropdownMenuFocusContextValue | null>(null)

const composeRefs =
  <TElement,>(...refs: (React.Ref<TElement> | undefined)[]) =>
  (node: TElement) => {
    for (const ref of refs) {
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
    }
  }

const DropdownMenu = ({
  children,
  modal = false,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Root>) => {
  const closeFromPointerRef = React.useRef(false)
  const triggerRef = React.useRef<HTMLElement | null>(null)
  const setTrigger = React.useCallback((node: HTMLElement | null) => {
    triggerRef.current = node
  }, [])
  const markKeyboardInteraction = React.useCallback(() => {
    closeFromPointerRef.current = false
  }, [])
  const markPointerInteraction = React.useCallback(() => {
    closeFromPointerRef.current = true
  }, [])
  const handleCloseAutoFocus = React.useCallback((event: Event) => {
    if (!closeFromPointerRef.current) {
      return
    }

    closeFromPointerRef.current = false
    event.preventDefault()

    const trigger = triggerRef.current
    const ownerWindow = trigger?.ownerDocument.defaultView

    ownerWindow?.requestAnimationFrame(() => {
      if (trigger && trigger.ownerDocument.activeElement === trigger) {
        trigger.blur()
      }
    })
  }, [])
  const contextValue = React.useMemo(
    () => ({
      handleCloseAutoFocus,
      markKeyboardInteraction,
      markPointerInteraction,
      setTrigger,
    }),
    [
      handleCloseAutoFocus,
      markKeyboardInteraction,
      markPointerInteraction,
      setTrigger,
    ],
  )

  return (
    <DropdownMenuFocusContext.Provider value={contextValue}>
      <DropdownMenuPrimitive.Root modal={modal} {...props}>{children}</DropdownMenuPrimitive.Root>
    </DropdownMenuFocusContext.Provider>
  )
}

const DropdownMenuTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Trigger>
>(({ onKeyDown, onPointerDown, ...props }, ref) => {
  const focusContext = React.useContext(DropdownMenuFocusContext)

  return (
    <DropdownMenuPrimitive.Trigger
      ref={composeRefs(ref, (node) => {
        focusContext?.setTrigger(node)
      })}
      onKeyDown={(event) => {
        focusContext?.markKeyboardInteraction()
        onKeyDown?.(event)
      }}
      onPointerDown={(event) => {
        focusContext?.markPointerInteraction()
        onPointerDown?.(event)
      }}
      {...props}
    />
  )
})
DropdownMenuTrigger.displayName = DropdownMenuPrimitive.Trigger.displayName

const DropdownMenuGroup = DropdownMenuPrimitive.Group

const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const DropdownMenuSub = DropdownMenuPrimitive.Sub

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      'flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground focus-visible:outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[highlighted]:outline-none data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
      inset && 'pl-8',
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto" />
  </DropdownMenuPrimitive.SubTrigger>
))
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      'z-50 max-w-[calc(100vw-2rem)] min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-floating outline-none focus:outline-none focus-visible:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-dropdown-menu-content-transform-origin]',
      className,
    )}
    {...props}
  />
))
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(
  (
    {
      className,
      onCloseAutoFocus,
      onKeyDown,
      onPointerDown,
      onPointerDownOutside,
      sideOffset = 4,
      ...props
    },
    ref,
  ) => {
    const focusContext = React.useContext(DropdownMenuFocusContext)

    return (
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          ref={ref}
          sideOffset={sideOffset}
          className={cn(
            'z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] max-w-[calc(100vw-2rem)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-floating outline-none focus:outline-none focus-visible:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-dropdown-menu-content-transform-origin]',
            className,
          )}
          onCloseAutoFocus={(event) => {
            focusContext?.handleCloseAutoFocus(event)
            onCloseAutoFocus?.(event)
          }}
          onKeyDown={(event) => {
            focusContext?.markKeyboardInteraction()
            onKeyDown?.(event)
          }}
          onPointerDown={(event) => {
            focusContext?.markPointerInteraction()
            onPointerDown?.(event)
          }}
          onPointerDownOutside={(event) => {
            focusContext?.markPointerInteraction()
            onPointerDownOutside?.(event)
          }}
          {...props}
        />
      </DropdownMenuPrimitive.Portal>
    )
  },
)
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground focus-visible:outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[highlighted]:outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
      inset && 'pl-8',
      className,
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground focus-visible:outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[highlighted]:outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      'relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground focus-visible:outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[highlighted]:outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
))
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn('px-2 py-1.5 text-sm font-semibold', inset && 'pl-8', className)}
    {...props}
  />
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-muted', className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return <span className={cn('ml-auto text-xs opacity-60', className)} {...props} />
}
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut'

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
  dropdownMenuItemClassName,
}
