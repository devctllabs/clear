import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ConfirmDialog } from '@shared/components/feedback/ConfirmDialog'
import { Button } from '@shared/components/ui/button'

import { useEmptyTrash, useTrash } from '../hooks/useTrash'

export const TrashHeaderAction = () => {
  const { t } = useTranslation()
  const trashQuery = useTrash()
  const emptyTrash = useEmptyTrash()
  const [isEmptyDialogOpen, setIsEmptyDialogOpen] = useState(false)
  const itemCount = trashQuery.data?.items.length ?? 0
  const openEmptyDialog = () => {
    emptyTrash.reset()
    setIsEmptyDialogOpen(true)
  }
  const closeEmptyDialog = () => {
    setIsEmptyDialogOpen(false)
    emptyTrash.reset()
  }

  if (itemCount === 0) {
    return null
  }

  return (
    <>
      <Button
        className="type-action h-9 rounded-full bg-primary px-4 uppercase text-primary-foreground hover:bg-primary/90"
        type="button"
        variant="destructive"
        onClick={openEmptyDialog}
      >
        {t(($) => $.trash.actions.empty)}
      </Button>
      <ConfirmDialog
        actionError={
          emptyTrash.isError
            ? { error: emptyTrash.error, title: t(($) => $.trash.errors.couldNotEmptyTrash) }
            : null
        }
        confirmLabel={t(($) => $.trash.actions.emptyTrash)}
        confirming={emptyTrash.isPending}
        description={t(($) => $.trash.dialogs.emptyTrashDescription)}
        open={isEmptyDialogOpen}
        title={t(($) => $.trash.dialogs.emptyTrashTitle)}
        onConfirm={() => {
          emptyTrash.mutate(undefined, {
            onSuccess: () => {
              setIsEmptyDialogOpen(false)
            },
          })
        }}
        onOpenChange={(open) => {
          if (!open) {
            closeEmptyDialog()
            return
          }

          setIsEmptyDialogOpen(true)
        }}
      />
    </>
  )
}
