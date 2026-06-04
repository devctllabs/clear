import { Folder as FolderIcon, Pencil, Trash2 } from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import {
  InventoryRowShell,
  inventoryRowOverlayClassName,
} from '@shared/components/data/InventoryList'
import { InventoryListWithSort } from '@shared/components/data/InventoryListWithSort'
import { ActionMenu } from '@shared/components/feedback/ActionMenu'
import { useDateFormatters } from '@shared/lib/translated-date-format'
import type { SortPreference } from '@shared/types/sort.types'
import { createOpenedFromState } from '@shared/lib/navigation-state'

import type { Folder } from '../types/folder.types'

export const FolderList = ({
  folders,
  onDelete,
  onSortChange,
  openedFrom,
  sort,
  workspaceId,
}: {
  folders: Folder[]
  onDelete: (folder: Folder) => void
  onSortChange: (sort: SortPreference) => void
  openedFrom?: string
  sort: SortPreference
  workspaceId: string
}) => (
  <FolderListContent
    folders={folders}
    openedFrom={openedFrom}
    sort={sort}
    workspaceId={workspaceId}
    onDelete={onDelete}
    onSortChange={onSortChange}
  />
)

const FolderListContent = ({
  folders,
  onDelete,
  onSortChange,
  openedFrom,
  sort,
  workspaceId,
}: {
  folders: Folder[]
  onDelete: (folder: Folder) => void
  onSortChange: (sort: SortPreference) => void
  openedFrom?: string
  sort: SortPreference
  workspaceId: string
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  if (folders.length === 0) {
    return null
  }

  return (
    <InventoryListWithSort
      getItemKey={(folder) => folder.id}
      items={folders}
      renderItem={(folder) => (
        <FolderRow
          folder={folder}
          workspaceId={workspaceId}
          onDelete={() => onDelete(folder)}
          onEdit={() => {
            void navigate({
              params: { folderId: folder.id, workspaceId },
              state: openedFrom ? createOpenedFromState(openedFrom) : undefined,
              to: '/dashboard/$workspaceId/folders/$folderId/edit',
            })
          }}
        />
      )}
      showSort={folders.length > 1}
      sort={sort}
      sortAriaLabel={t(($) => $.folders.sort.ariaLabel)}
      sortFieldOptions={[
        { field: 'title', label: t(($) => $.folders.sort.name) },
        { field: 'updated', label: t(($) => $.folders.sort.updated) },
      ]}
      title={t(($) => $.folders.labels.folders)}
      onSortChange={onSortChange}
    />
  )
}

const FolderRow = ({
  folder,
  onDelete,
  onEdit,
  workspaceId,
}: {
  folder: Folder
  onDelete: () => void
  onEdit: () => void
  workspaceId: string
}) => (
  <FolderRowContent
    folder={folder}
    workspaceId={workspaceId}
    onDelete={onDelete}
    onEdit={onEdit}
  />
)

const FolderRowContent = ({
  folder,
  onDelete,
  onEdit,
  workspaceId,
}: {
  folder: Folder
  onDelete: () => void
  onEdit: () => void
  workspaceId: string
}) => {
  const { t } = useTranslation()
  const { formatRelativeDate } = useDateFormatters()

  return (
  <InventoryRowShell>
    <Link
      aria-label={folder.name}
      className={inventoryRowOverlayClassName}
      params={{ folderId: folder.id, workspaceId }}
      to="/dashboard/$workspaceId/folders/$folderId"
    />
    <span className="pointer-events-none relative z-20 inline-flex size-6 shrink-0 items-center justify-center text-foreground">
      <FolderIcon className="size-5 fill-current stroke-[2.1]" />
    </span>
    <span className="pointer-events-none relative z-20 min-w-0">
      <span className="line-clamp-2 text-wrap-anywhere type-row-title">
        {folder.name}
      </span>
      <span className="mt-1 block text-wrap-anywhere text-xs font-medium text-muted-foreground">
        {formatRelativeDate(folder.updatedAt)}
      </span>
    </span>
    <div className="pointer-events-auto relative z-20 flex shrink-0 items-center justify-self-end">
      <ActionMenu
        ariaLabel={t(($) => $.decks.actions.actionMenu, { title: folder.name })}
        items={[
          {
            icon: <Pencil className="size-4 stroke-[2.4]" />,
            label: t(($) => $.common.actions.edit),
            onSelect: onEdit,
          },
          {
            icon: <Trash2 className="size-4 stroke-[2.2]" />,
            label: t(($) => $.common.actions.delete),
            onSelect: onDelete,
            tone: 'danger',
          },
        ]}
        triggerFocusSurface="card"
      />
    </div>
  </InventoryRowShell>
  )
}
