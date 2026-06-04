import { Ellipsis, FileText, Pencil, Trash2 } from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'

import { ActionMenu } from '@shared/components/feedback/ActionMenu'
import { Badge } from '@shared/components/ui/badge'
import { cardFocusRingClassName } from '@shared/components/ui/focus'
import { InventoryListWithSort } from '@shared/components/data/InventoryListWithSort'
import { inventoryRowClassName } from '@shared/components/layout/surfaces'
import { formatRelativeDate } from '@shared/lib/date-format'
import { cn } from '@shared/lib/utils'
import type { SortPreference } from '@shared/types/sort.types'
import { createOpenedFromState } from '@shared/lib/navigation-state'

import type { NoteListItem } from '../types/note.types'

const noteStatusStyles: Record<
  NoteListItem['status'],
  {
    className: string
    label: string
  }
> = {
  mastered: {
    className: 'border-border bg-muted/50 text-muted-foreground',
    label: 'Mastered',
  },
  'in-progress': {
    className: 'border-border bg-muted/50 text-muted-foreground',
    label: 'In progress',
  },
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
            aria-label={`Open ${note.title}`}
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
                    noteStatusStyles[note.status].className,
                  )}
                  variant="outline"
                >
                  {noteStatusStyles[note.status].label}
                </Badge>
                <span
                  aria-hidden="true"
                  className="flex w-2 shrink-0 items-center justify-center text-[10px] leading-none text-muted-foreground"
                >
                  •
                </span>
                <span className="line-clamp-2 min-w-0 text-wrap-anywhere text-[10px] font-medium text-muted-foreground">
                  {formatRelativeDate(note.updatedAt).replace('Updated ', '')}
                </span>
              </div>
            </div>
          </Link>
          <div className="flex shrink-0 items-center pr-4">
            <ActionMenu
              dialogLabel={`${note.title} actions`}
              items={[
                {
                  icon: <Pencil className="size-4 stroke-[2.4]" />,
                  label: 'Edit',
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
                  label: 'Delete',
                  onSelect: () => onDelete(note),
                  tone: 'danger',
                },
              ]}
              triggerAriaLabel={`${note.title} actions`}
              triggerClassName="text-muted-foreground/70 hover:text-primary"
              triggerFocusSurface="card"
              triggerIcon={<Ellipsis className="size-4.5" />}
            />
          </div>
        </div>
      )}
      sort={sort}
      sortAriaLabel="Sort notes"
      sortFieldOptions={[
        { field: 'title', label: 'Title' },
        { field: 'updated', label: 'Updated' },
      ]}
      title="Notes"
      onSortChange={onSortChange}
    />
  )
}
