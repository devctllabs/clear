import { useEffect, useState } from 'react'
import { CircleAlert, RefreshCw, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { translateDomainError } from '@shared/errors/translation'
import { mobileLaneWidthClassName } from '@shared/components/layout/LayoutLane'
import { Button } from '@shared/components/ui/button'
import { IconButton } from '@shared/components/ui/icon-button'
import { cn } from '@shared/lib/utils'

import { normalizeError } from './LoadErrorState'

export const bottomStatusContentPaddingClassName =
  'pb-[calc(13rem+env(safe-area-inset-bottom)+var(--visual-viewport-bottom-offset,0px))]'

export const stackedBottomStatusContentPaddingClassName =
  'pb-[calc(18rem+env(safe-area-inset-bottom)+var(--visual-viewport-bottom-offset,0px))]'

export const desktopBottomStatusStackClassName =
  'bottom-8 left-[var(--desktop-sidebar-width)] right-0 px-8'

export const BottomStatusStack = ({
  children,
  className,
  contentClassName,
}: {
  children: ReactNode
  className?: string
  contentClassName?: string
}) => (
  <div
    className={cn(
      'pointer-events-none fixed bottom-[calc(7rem+env(safe-area-inset-bottom)+var(--visual-viewport-bottom-offset,0px))] left-0 right-0 z-40 px-6',
      className,
    )}
  >
    <div
      className={cn(
        'mx-auto flex flex-col gap-3',
        mobileLaneWidthClassName,
        contentClassName,
      )}
    >
      {children}
    </div>
  </div>
)

export const BottomStatus = ({
  actionLabel,
  className,
  dismissLabel,
  dismissKey,
  error,
  onAction,
  title,
}: {
  actionLabel?: string
  className?: string
  dismissLabel?: string
  dismissKey?: unknown
  error: unknown
  onAction?: () => void
  title: string
}) => {
  const { t } = useTranslation()
  const [dismissedKey, setDismissedKey] = useState<unknown>(null)

  useEffect(() => {
    if (!error) {
      setDismissedKey(null)
    }
  }, [error])

  const currentDismissKey = dismissKey ?? error

  if (!error || dismissedKey === currentDismissKey) {
    return null
  }

  const normalizedError = normalizeError(error)
  const message = translateDomainError(t, normalizedError)
  const resolvedDismissLabel = dismissLabel ?? t(($) => $.common.actions.dismissStatus)

  return (
    <div
      aria-live="polite"
      className={cn(
        'pointer-events-auto flex items-start gap-3 rounded-card border border-border bg-card px-4 py-4 text-left shadow-floating motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:duration-200 motion-safe:ease-out',
        className,
      )}
      role="status"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
        <CircleAlert className="size-4 text-muted-foreground" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-wrap-anywhere type-label uppercase text-foreground">
          {title}
        </p>
        <p className="text-wrap-anywhere mt-1 text-sm font-medium leading-5 text-muted-foreground">
          {message}
        </p>
        {onAction ? (
          <Button
            className="type-action mt-3 h-auto min-h-9 max-w-full rounded-full border border-border bg-card px-4 py-2 text-xs text-foreground shadow-none hover:bg-muted"
            type="button"
            variant="outline"
            onClick={onAction}
          >
            <RefreshCw aria-hidden="true" className="size-3.5" />
            {actionLabel ?? t(($) => $.common.actions.tryAgain)}
          </Button>
        ) : null}
      </div>
      <IconButton
        className="-mr-1 -mt-1"
        focusSurface="card"
        icon={<X aria-hidden="true" className="size-4" />}
        label={resolvedDismissLabel}
        size="sm"
        type="button"
        onClick={() => {
          setDismissedKey(currentDismissKey)
        }}
      />
    </div>
  )
}

export const BottomActionErrorStatus = ({
  className,
  contentClassName,
  dismissKey,
  error,
  title,
}: {
  className?: string
  contentClassName?: string
  dismissKey?: unknown
  error: unknown
  title: string
}) => {
  const { t } = useTranslation()

  if (!error) {
    return null
  }

  return (
    <BottomStatusStack className={className} contentClassName={contentClassName}>
      <BottomStatus
        dismissKey={dismissKey}
        dismissLabel={t(($) => $.common.actions.dismissError)}
        error={error}
        title={title}
      />
    </BottomStatusStack>
  )
}
