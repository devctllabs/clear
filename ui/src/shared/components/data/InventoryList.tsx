import type { Key, ReactNode, ComponentPropsWithoutRef } from 'react'

import { SectionHeading } from '@shared/components/layout/Screen'
import {
  inventoryDividerClassName,
  inventoryRowClassName,
  inventorySectionClassName,
  inventorySurfaceClassName,
} from '@shared/components/layout/surfaces'
import { Card } from '@shared/components/ui/card'
import { focusRingClassName } from '@shared/components/ui/focus'
import { cn } from '@shared/lib/utils'

export const inventoryRowOverlayClassName = cn(
  focusRingClassName,
  'absolute inset-0 z-10 block cursor-pointer rounded-[1.375rem] text-left focus-visible:ring-inset focus-visible:ring-offset-0',
)

export type InventorySectionProps = Omit<ComponentPropsWithoutRef<'section'>, 'title'> & {
  actionSlot?: ReactNode
  headerClassName?: string
  title: ReactNode
}

export const InventorySection = ({
  actionSlot,
  children,
  className,
  headerClassName,
  title,
  ...props
}: InventorySectionProps) => (
  <section
    className={cn(inventorySectionClassName, className)}
    {...props}
  >
    <div
      className={cn('flex min-h-6 min-w-0 items-center justify-between gap-2', headerClassName)}
    >
      <SectionHeading>{title}</SectionHeading>
      {actionSlot}
    </div>
    {children}
  </section>
)

export type InventoryListProps<TItem> = {
  className?: string
  getItemKey: (item: TItem, index: number) => Key
  itemClassName?: string
  items: readonly TItem[]
  renderItem: (item: TItem, index: number) => ReactNode
}

export const InventoryList = <TItem,>({
  className,
  getItemKey,
  itemClassName,
  items,
  renderItem,
}: InventoryListProps<TItem>) => {
  if (items.length === 0) {
    return null
  }

  return (
    <Card className={cn(inventorySurfaceClassName, className)}>
      {items.map((item, index) => (
        <div className={cn('min-w-0', itemClassName)} key={getItemKey(item, index)}>
          {renderItem(item, index)}
          {index < items.length - 1 ? (
            <div className={inventoryDividerClassName} />
          ) : null}
        </div>
      ))}
    </Card>
  )
}

export type InventoryRowShellProps = ComponentPropsWithoutRef<'div'>

export const InventoryRowShell = ({
  className,
  children,
  ...props
}: InventoryRowShellProps) => (
  <div
    className={cn(
      'relative isolate grid w-full min-w-0 max-w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-5 py-4',
      inventoryRowClassName,
      className,
    )}
    {...props}
  >
    {children}
  </div>
)
