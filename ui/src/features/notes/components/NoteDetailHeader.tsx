import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

import { ActionMenu } from '@shared/components/feedback/ActionMenu'
import { mobileLaneClassName } from '@shared/components/layout/LayoutLane'
import { BackControl } from '@shared/components/layout/Screen'
import { cn } from '@shared/lib/utils'

import type { NoteDetail } from '../types/note.types'

export const NoteDetailHeader = ({
  backTo,
  note,
  onDelete,
  onEdit,
}: {
  backTo: string
  note: NoteDetail
  onDelete: () => void
  onEdit: () => void
}) => (
  <header className="fixed inset-x-0 top-0 z-50 w-full bg-background/95 backdrop-blur-md">
    <div className={cn(mobileLaneClassName, 'px-6 pb-2 pt-12')}>
      <div className="grid min-h-11 grid-cols-[44px_1fr_44px] items-center">
        <BackControl fallbackTo={backTo} />
        <h1 className="type-row-title text-center text-foreground">
          Note Details
        </h1>
        <ActionMenu
          dialogLabel={`${note.title} actions`}
          items={[
            {
              icon: <Pencil className="size-4 stroke-[2.4]" />,
              label: 'Edit',
              onSelect: onEdit,
            },
            {
              icon: <Trash2 className="size-4 stroke-[2.2]" />,
              label: 'Delete',
              onSelect: onDelete,
              tone: 'danger',
            },
          ]}
          triggerAriaLabel={`${note.title} actions`}
          triggerClassName="text-foreground hover:bg-muted"
          triggerIcon={<MoreHorizontal className="size-5 text-foreground" />}
        />
      </div>
    </div>
  </header>
)
