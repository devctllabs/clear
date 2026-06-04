import {
  Archive,
  FileText,
  Folder,
  Layers3,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import type { ReactNode } from 'react'

import { ActionMenu } from '@shared/components/feedback/ActionMenu'
import { PendingSpinner } from '@shared/components/feedback/PendingSpinner'
import { Card } from '@shared/components/ui/card'
import { formatDeletedAge } from '@shared/lib/date-format'
import {
  formatCompactLocationPath,
  formatLocationPathLabel,
} from '@shared/lib/location-path'

import type { TrashItem, TrashKind } from '../types/trash.types'

const trashKindConfig: Record<TrashKind, { icon: ReactNode; label: string }> = {
  deck: {
    icon: <Layers3 className="size-4.5 stroke-[2.2]" />,
    label: 'Deck',
  },
  folder: {
    icon: <Folder className="size-4.5 fill-current stroke-[2.1]" />,
    label: 'Folder',
  },
  note: {
    icon: <FileText className="size-4.5 stroke-[2.2]" />,
    label: 'Note',
  },
  workspace: {
    icon: <Archive className="size-4.5 stroke-[2.2]" />,
    label: 'Workspace',
  },
}

const originalLocationPrefix = 'Original location: '

export const WorkspaceTrashList = ({
  items,
  onDeleteRequest,
  onRestore,
  restoringItemId,
  showRestoringSpinner = false,
}: {
  items: TrashItem[]
  onDeleteRequest: (item: TrashItem) => void
  onRestore: (itemId: string) => void
  restoringItemId?: string | null
  showRestoringSpinner?: boolean
}) => (
  <Card className="overflow-hidden rounded-card border border-border bg-card py-0 shadow-card">
    {items.map((item, index) => (
      <div key={item.id}>
        <WorkspaceTrashRow
          item={item}
          onDeleteRequest={onDeleteRequest}
          onRestore={onRestore}
          restoring={restoringItemId === item.id}
          showRestoringSpinner={showRestoringSpinner}
        />
        {index < items.length - 1 ? (
          <div className="mx-6 border-t border-border/60" />
        ) : null}
      </div>
    ))}
  </Card>
)

const WorkspaceTrashRow = ({
  item,
  onDeleteRequest,
  onRestore,
  restoring,
  showRestoringSpinner,
}: {
  item: TrashItem
  onDeleteRequest: (item: TrashItem) => void
  onRestore: (itemId: string) => void
  restoring: boolean
  showRestoringSpinner: boolean
}) => {
  const kindConfig = trashKindConfig[item.kind]
  const locationLabel = `${originalLocationPrefix}${formatLocationPathLabel(item.locationPath)}`
  const compactLocationLabel =
    `${originalLocationPrefix}${formatCompactLocationPath(item.locationPath)}`

  return (
    <div
      aria-busy={restoring || undefined}
      className="flex w-full min-w-0 items-start gap-4 px-6 py-5"
    >
      <span className="mt-1 flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
        {kindConfig.icon}
      </span>

      <div className="min-w-0 flex-1">
        <span className="line-clamp-2 text-wrap-anywhere type-row-title block text-foreground">
          {item.title}
        </span>
        <div className="mt-1 flex min-w-0 items-center gap-2">
          <span className="text-wrap-anywhere type-label inline-flex min-w-0 items-center rounded-full bg-muted px-2.5 py-1 uppercase text-muted-foreground">
            {kindConfig.label}
          </span>
        </div>
        <div className="mt-0.5 space-y-0.5">
          <p
            aria-label={locationLabel}
            className="text-wrap-anywhere text-[13px] leading-5 text-muted-foreground"
            title={locationLabel}
          >
            {compactLocationLabel}
          </p>
          <p className="text-wrap-anywhere text-[13px] leading-5 text-muted-foreground">
            {formatDeletedAge(item.deletedAt)}
          </p>
        </div>
      </div>

      <div className="flex size-11 shrink-0 items-start justify-center">
        {restoring ? (
          <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
            {showRestoringSpinner ? (
              <PendingSpinner label={`Restoring ${item.title}`} />
            ) : null}
          </span>
        ) : (
          <ActionMenu
            dialogLabel={`${item.title} trash actions`}
            items={[
              {
                icon: <RotateCcw className="size-4 stroke-[2.4]" />,
                label: 'Restore',
                onSelect: () => {
                  onRestore(item.id)
                },
              },
              {
                icon: <Trash2 className="size-4 stroke-[2.2]" />,
                label: 'Delete',
                onSelect: () => {
                  onDeleteRequest(item)
                },
                tone: 'danger',
              },
            ]}
            triggerAriaLabel={`${item.title} trash actions`}
            triggerFocusSurface="card"
          />
        )}
      </div>
    </div>
  )
}
