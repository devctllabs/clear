import { useEffect, useId, useRef, useState } from 'react'

import { Button } from '@shared/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@shared/components/ui/dialog'
import { cardInputFocusRingClassName } from '@shared/components/ui/focus'
import { cn } from '@shared/lib/utils'

import {
  isSettingsFsrsParams,
  settingsFsrsDefaultParams,
  settingsFsrsParamsLength,
} from '../utils/fsrs-params'

export const SettingsFsrsParamsDialog = ({
  open,
  onOpenChange,
  onSave,
  value,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (value: number[]) => void
  value: number[]
}) => {
  const errorId = useId()
  const helperId = useId()
  const restoreFocusRef = useRef<HTMLElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [draft, setDraft] = useState(JSON.stringify(value, null, 2))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    setDraft(JSON.stringify(value, null, 2))
    setError(null)
  }, [open, value])

  const handleSave = () => {
    try {
      const parsed = JSON.parse(draft) as unknown

      if (!isSettingsFsrsParams(parsed)) {
        setError(
          `Enter a JSON array with exactly ${settingsFsrsParamsLength} finite numbers.`,
        )
        return
      }

      onSave(parsed)
      onOpenChange(false)
    } catch {
      setError('Paste valid JSON with 21 numeric values.')
    }
  }

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
        className="max-w-md p-5"
        onCloseAutoFocus={(event) => {
          if (!restoreFocusRef.current) {
            return
          }

          event.preventDefault()
          restoreFocusRef.current.focus()
        }}
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          rememberFocusedElement()
          textareaRef.current?.focus()
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <DialogTitle className="text-wrap-anywhere type-study-title text-foreground">
              Edit FSRS parameters
            </DialogTitle>
            <DialogDescription
              className="text-wrap-anywhere mt-2 text-sm leading-6 text-muted-foreground"
            >
              Paste a JSON array with 21 numbers to override the scheduler weights.
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <Button
              className="h-10 rounded-full"
              focusSurface="card"
              type="button"
              variant="outline"
            >
              Close
            </Button>
          </DialogClose>
        </div>

        <textarea
          ref={textareaRef}
          aria-describedby={
            error ? `${helperId} ${errorId}` : helperId
          }
          aria-invalid={error ? true : undefined}
          aria-label="FSRS Parameters JSON"
          autoComplete="off"
          className={cn(
            'mt-5 min-h-64 w-full rounded-compact border border-border bg-input px-4 py-4 font-mono text-[12px] leading-6 text-foreground transition-colors placeholder:text-muted-foreground/70 focus:bg-input',
            cardInputFocusRingClassName,
          )}
          name="fsrs-parameters-json"
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value)
            setError(null)
          }}
        />

        <p
          className="text-wrap-anywhere mt-3 text-[12px] leading-5 text-muted-foreground"
          id={helperId}
        >
          This is an expert override. Values must stay in order.
        </p>

        {error ? (
          <p
            aria-live="assertive"
            className="text-wrap-anywhere mt-2 text-[12px] font-medium leading-5 text-destructive"
            id={errorId}
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <Button
            className="h-10 rounded-full"
            focusSurface="card"
            type="button"
            variant="outline"
            onClick={() => {
              setDraft(JSON.stringify(settingsFsrsDefaultParams, null, 2))
              setError(null)
            }}
          >
            Reset to defaults
          </Button>

          <div className="ml-auto flex items-center gap-3">
            <DialogClose asChild>
              <Button
                className="h-10 rounded-full"
                focusSurface="card"
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              className="h-10 rounded-full bg-primary px-5 text-primary-foreground hover:bg-primary/90"
              focusSurface="card"
              type="button"
              variant="default"
              onClick={handleSave}
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
