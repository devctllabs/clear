import { Ellipsis, FileText, Pencil, Trash2 } from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { ActionMenu } from '@shared/components/feedback/ActionMenu'
import { Badge } from '@shared/components/ui/badge'
import { cardFocusRingClassName } from '@shared/components/ui/focus'
import { InventoryListWithSort } from '@shared/components/data/InventoryListWithSort'
import { inventoryRowClassName } from '@shared/components/layout/surfaces'
import { useDateFormatters } from '@shared/lib/translated-date-format'
import { cn } from '@shared/lib/utils'
import type { SortPreference } from '@shared/types/sort.types'
import { createOpenedFromState } from '@shared/lib/navigation-state'

import type { NoteListItem } from '../types/note.types'

const noteStatusStyles: Record<NoteListItem['status'], string> = {
  mastered: 'border-border bg-muted/50 text-muted-foreground',
  'in-progress': 'border-border bg-muted/50 text-muted-foreground',
}

export const NoteList = ({
  deckId,
  notes,
  onDelete,
  onSortChange,
  openedFrom,
  sort,
  workspaceId,
}: {
  deckId: string
  notes: NoteListItem[]
  onDelete: (note: NoteListItem) => void
  onSortChange: (sort: SortPreference) => void
  openedFrom?: string
  sort: SortPreference
  workspaceId: string
}) => (
  <NoteListContent
    deckId={deckId}
    notes={notes}
    openedFrom={openedFrom}
    sort={sort}
    workspaceId={workspaceId}
    onDelete={onDelete}
    onSortChange={onSortChange}
  />
)

const NoteListContent = ({
  deckId,
  notes,
  onDelete,
  onSortChange,
  openedFrom,
  sort,
  workspaceId,
}: {
  deckId: string
  notes: NoteListItem[]
  onDelete: (note: NoteListItem) => void
  onSortChange: (sort: SortPreference) => void
  openedFrom?: string
  sort: SortPreference
  workspaceId: string
}) => {
  const { t } = useTranslation()
  const { formatUpdatedAge } = useDateFormatters()
  const navigate = useNavigate()

  if (notes.length === 0) {
    return null
  }

  return (
    <InventoryListWithSort
      getItemKey={(note) => note.id}
      items={notes}
      renderItem={(note) => (
        <div className={cn('flex w-full min-w-0 items-stretch gap-0 px-0 py-0', inventoryRowClassName)}>
          <Link
            aria-label={t(($) => $.notes.actions.openNote, { title: note.title })}
            className={cn(
              'group flex min-w-0 flex-1 items-center gap-4 px-5 py-4 text-left transition-colors',
              cardFocusRingClassName,
            )}
            params={{ deckId, noteId: note.id, workspaceId }}
            to="/dashboard/$workspaceId/decks/$deckId/notes/$noteId"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
              <FileText className="size-5 text-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 text-wrap-anywhere type-row-title text-primary">
                {note.title}
              </h3>
              <div className="mt-1 flex min-w-0 items-center gap-0.5">
                <Badge
                  className={cn(
                    'type-label rounded-full px-2 py-0.5 normal-case',
                    noteStatusStyles[note.status],
                  )}
                  variant="outline"
                >
                  {note.status === 'mastered'
                    ? t(($) => $.notes.labels.mastered)
                    : t(($) => $.notes.labels.inProgress)}
                </Badge>
                <span
                  aria-hidden="true"
                  className="flex w-2 shrink-0 items-center justify-center text-[10px] leading-none text-muted-foreground"
                >
                  •
                </span>
                <span className="line-clamp-2 min-w-0 text-wrap-anywhere text-[10px] font-medium text-muted-foreground">
                  {formatUpdatedAge(note.updatedAt)}
                </span>
              </div>
            </div>
          </Link>
          <div className="flex shrink-0 items-center pr-4">
            <ActionMenu
              dialogLabel={t(($) => $.decks.actions.actionMenu, { title: note.title })}
              items={[
                {
                  icon: <Pencil className="size-4 stroke-[2.4]" />,
                  label: t(($) => $.common.actions.edit),
                  onSelect: () => {
                    void navigate({
                      params: {
                        deckId,
                        noteId: note.id,
                        workspaceId,
                      },
                      state: openedFrom ? createOpenedFromState(openedFrom) : undefined,
                      to: '/dashboard/$workspaceId/decks/$deckId/notes/$noteId/edit',
                    })
                  },
                },
                {
                  icon: <Trash2 className="size-4 stroke-[2.2]" />,
                  label: t(($) => $.common.actions.delete),
                  onSelect: () => onDelete(note),
                  tone: 'danger',
                },
              ]}
              triggerAriaLabel={t(($) => $.decks.actions.actionMenu, { title: note.title })}
              triggerClassName="text-muted-foreground/70 hover:text-primary"
              triggerFocusSurface="card"
              triggerIcon={<Ellipsis className="size-4.5" />}
            />
          </div>
        </div>
      )}
      sort={sort}
      sortAriaLabel={t(($) => $.notes.sort.ariaLabel)}
      sortFieldOptions={[
        { field: 'title', label: t(($) => $.notes.sort.title) },
        { field: 'updated', label: t(($) => $.notes.sort.updated) },
      ]}
      title={t(($) => $.notes.labels.notes)}
      onSortChange={onSortChange}
    />
  )
}
