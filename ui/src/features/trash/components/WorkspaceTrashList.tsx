import {
  Archive,
  FileText,
  Folder,
  Layers3,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { ActionMenu } from '@shared/components/feedback/ActionMenu'
import { PendingSpinner } from '@shared/components/feedback/PendingSpinner'
import { Card } from '@shared/components/ui/card'
import {
  formatCompactLocationPath,
  formatLocationPathLabel,
} from '@shared/lib/location-path'
import { useDateFormatters } from '@shared/lib/translated-date-format'

import type { TrashItem, TrashKind } from '../types/trash.types'

const trashKindConfig: Record<TrashKind, { icon: ReactNode }> = {
  deck: {
    icon: <Layers3 className="size-4.5 stroke-[2.2]" />,
  },
  folder: {
    icon: <Folder className="size-4.5 fill-current stroke-[2.1]" />,
  },
  note: {
    icon: <FileText className="size-4.5 stroke-[2.2]" />,
  },
  workspace: {
    icon: <Archive className="size-4.5 stroke-[2.2]" />,
  },
}

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
  const { t } = useTranslation()
  const { formatDeletedAge } = useDateFormatters()
  const kindConfig = trashKindConfig[item.kind]
  const kindLabel =
    item.kind === 'deck'
      ? t(($) => $.trash.kinds.deck)
      : item.kind === 'folder'
        ? t(($) => $.trash.kinds.folder)
        : item.kind === 'note'
          ? t(($) => $.trash.kinds.note)
          : t(($) => $.trash.kinds.workspace)
  const locationLabel = t(($) => $.trash.labels.originalLocation, {
    location: formatLocationPathLabel(item.locationPath),
  })
  const compactLocationLabel = t(($) => $.trash.labels.originalLocation, {
    location: formatCompactLocationPath(item.locationPath),
  })

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
            {kindLabel}
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
              <PendingSpinner
                label={t(($) => $.trash.actions.restoringItem, { title: item.title })}
              />
            ) : null}
          </span>
        ) : (
          <ActionMenu
            dialogLabel={t(($) => $.trash.labels.trashActions, { title: item.title })}
            items={[
              {
                icon: <RotateCcw className="size-4 stroke-[2.4]" />,
                label: t(($) => $.trash.actions.restore),
                onSelect: () => {
                  onRestore(item.id)
                },
              },
              {
                icon: <Trash2 className="size-4 stroke-[2.2]" />,
                label: t(($) => $.common.actions.delete),
                onSelect: () => {
                  onDeleteRequest(item)
                },
                tone: 'danger',
              },
            ]}
            triggerAriaLabel={t(($) => $.trash.labels.trashActions, { title: item.title })}
            triggerFocusSurface="card"
          />
        )}
      </div>
    </div>
  )
}
