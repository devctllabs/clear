import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

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
  <NoteDetailHeaderContent
    backTo={backTo}
    note={note}
    onDelete={onDelete}
    onEdit={onEdit}
  />
)

const NoteDetailHeaderContent = ({
  backTo,
  note,
  onDelete,
  onEdit,
}: {
  backTo: string
  note: NoteDetail
  onDelete: () => void
  onEdit: () => void
}) => {
  const { t } = useTranslation()

  return (
  <header className="fixed inset-x-0 top-0 z-50 w-full bg-background/95 backdrop-blur-md">
    <div className={cn(mobileLaneClassName, 'px-6 pb-2 pt-12')}>
      <div className="grid min-h-11 grid-cols-[44px_1fr_44px] items-center">
        <BackControl fallbackTo={backTo} />
        <h1 className="type-row-title text-center text-foreground">
          {t(($) => $.notes.labels.noteDetails)}
        </h1>
        <ActionMenu
          dialogLabel={t(($) => $.common.actions.itemActions, { title: note.title })}
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
          triggerAriaLabel={t(($) => $.common.actions.itemActions, { title: note.title })}
          triggerClassName="text-foreground hover:bg-muted"
          triggerIcon={<MoreHorizontal className="size-5 text-foreground" />}
        />
      </div>
    </div>
  </header>
  )
}
