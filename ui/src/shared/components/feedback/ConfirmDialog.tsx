import { useId, useRef } from 'react'
import { CircleAlert } from 'lucide-react'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@shared/components/ui/dialog'
import { Button } from '@shared/components/ui/button'
import { getUserMessage } from '@shared/errors'
import { useDelayedBoolean } from '@shared/hooks/useDelayedBoolean'

import { normalizeError } from './LoadErrorState'
import { PendingSpinner } from './PendingSpinner'

export type ConfirmDialogActionError = {
  error: unknown
  title: string
}

export const ConfirmDialog = ({
  actionError,
  confirmLabel,
  confirming = false,
  description,
  onConfirm,
  onOpenChange,
  open,
  title,
}: {
  actionError?: ConfirmDialogActionError | null
  confirmLabel: string
  confirming?: boolean
  description: string
  onConfirm: () => void
  onOpenChange: (open: boolean) => void
  open: boolean
  title: string
}) => {
  const actionErrorId = useId()
  const restoreFocusRef = useRef<HTMLElement | null>(null)
  const showConfirmSpinner = useDelayedBoolean(confirming, 250)
  const normalizedActionError = actionError
    ? normalizeError(actionError.error)
    : null

  const rememberFocusedElement = () => {
    const activeElement = document.activeElement

    restoreFocusRef.current =
      activeElement instanceof HTMLElement && activeElement !== document.body
        ? activeElement
        : null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-sm"
        onCloseAutoFocus={(event) => {
          if (!restoreFocusRef.current) {
            return
          }

          event.preventDefault()
          restoreFocusRef.current.focus()
        }}
        onOpenAutoFocus={rememberFocusedElement}
      >
        <DialogTitle className="text-wrap-anywhere type-study-title text-foreground">
          {title}
        </DialogTitle>
        <DialogDescription
          className="text-wrap-anywhere mt-3 text-sm leading-6 text-muted-foreground"
        >
          {description}
        </DialogDescription>
        <div className="mt-6 flex flex-col-reverse gap-3 min-[390px]:flex-row min-[390px]:items-center">
          <DialogClose asChild>
            <Button
              className="min-h-11 rounded-full px-5 py-2 min-[390px]:w-28"
              variant="outline"
              type="button"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            aria-busy={confirming || undefined}
            className="min-h-11 min-w-0 flex-1 rounded-full bg-primary px-5 py-2 text-primary-foreground hover:bg-primary/90"
            disabled={confirming}
            variant="destructive"
            onClick={() => {
              if (confirming) {
                return
              }

              onConfirm()
            }}
            type="button"
          >
            {showConfirmSpinner ? (
              <PendingSpinner decorative className="size-4" />
            ) : normalizedActionError ? (
              <CircleAlert aria-hidden="true" />
            ) : null}
            <span className="min-w-0 whitespace-normal text-center leading-5">
              {confirmLabel}
            </span>
          </Button>
        </div>
        {actionError && normalizedActionError ? (
          <p
            aria-live="assertive"
            className="text-wrap-anywhere mt-4 text-center text-sm font-semibold leading-5 text-destructive"
            id={actionErrorId}
            role="alert"
          >
            <span className="font-bold">{actionError.title}</span>.{' '}
            {getUserMessage(normalizedActionError)}
          </p>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
