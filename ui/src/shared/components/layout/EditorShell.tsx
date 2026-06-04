import { CircleAlert, X } from 'lucide-react'
import type { ReactNode } from 'react'

import { normalizeError } from '@shared/components/feedback/LoadErrorState'
import { PendingSpinner } from '@shared/components/feedback/PendingSpinner'
import { Button } from '@shared/components/ui/button'
import { getUserMessage } from '@shared/errors'
import { useDelayedBoolean } from '@shared/hooks/useDelayedBoolean'
import { useIsDesktopLayout } from '@shared/hooks/useAppLayoutMode'
import { useVisualViewportBottomOffset } from '@shared/hooks/useVisualViewportBottomOffset'
import { cn } from '@shared/lib/utils'

import {
  desktopEditorLaneClassName,
  editorLaneClassName,
  mobileLaneClassName,
} from './LayoutLane'
import { BackControl } from './Screen'

export type EditorActionError = {
  error: unknown
  title: string
}

export const EditorActionErrorMessage = ({
  actionError,
  className,
  id,
}: {
  actionError?: EditorActionError | null
  className?: string
  id?: string
}) => {
  if (!actionError) {
    return null
  }

  const normalizedError = normalizeError(actionError.error)

  return (
    <p
      aria-live="assertive"
      className={cn(
        'text-wrap-anywhere mt-3 text-center text-sm font-semibold leading-5 text-destructive',
        className,
      )}
      id={id}
      role="alert"
    >
      <span className="font-bold">{actionError.title}</span>.{' '}
      {getUserMessage(normalizedError)}
    </p>
  )
}

export const EditorShell = ({
  actionLabel,
  actionError,
  backTo,
  children,
  isSubmitting = false,
  mobileContentBottomPaddingClassName,
  onSubmit,
  title,
}: {
  actionLabel: string
  actionError?: EditorActionError | null
  backTo: string
  children: ReactNode
  isSubmitting?: boolean
  mobileContentBottomPaddingClassName?: string
  onSubmit: () => void
  title: string
}) => {
  useVisualViewportBottomOffset()

  const actionErrorId = actionError ? 'editor-action-error' : undefined
  const isDesktop = useIsDesktopLayout()
  const showSubmitSpinner = useDelayedBoolean(isSubmitting, 250)
  const defaultMobileContentBottomPadding = actionError ? 'pb-44' : 'pb-32'
  const contentBottomPadding =
    mobileContentBottomPaddingClassName ?? defaultMobileContentBottomPadding
  const laneClassName = isDesktop ? desktopEditorLaneClassName : editorLaneClassName
  const submitButton = (
    <EditorSubmitButton
      actionError={actionError}
      actionErrorId={actionErrorId}
      actionLabel={actionLabel}
      isSubmitting={isSubmitting}
      showSubmitSpinner={showSubmitSpinner}
      variant={isDesktop ? 'desktop' : 'mobile'}
      onSubmit={onSubmit}
    />
  )

  return (
    <main id="main-content" className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 z-50 w-full bg-background/95 backdrop-blur-md">
        <div
          className={cn(
            laneClassName,
            isDesktop
              ? 'grid h-auto grid-cols-[minmax(0,1fr)_auto] items-center gap-6 px-8 py-6'
              : 'grid h-16 grid-cols-[44px_1fr_44px] items-center px-6',
          )}
        >
          <div
            className={cn(
              isDesktop ? 'flex min-w-0 items-center gap-4' : 'contents',
            )}
          >
            <BackControl
              ariaLabel="Close editor"
              fallbackTo={backTo}
              icon={<X className="size-5" />}
            />
            <h1
              className={cn(
                'line-clamp-2 text-wrap-anywhere type-study-title text-foreground',
                isDesktop
                  ? 'min-w-0 text-left'
                  : 'text-center',
              )}
            >
              {title}
            </h1>
          </div>
          {isDesktop ? submitButton : <div aria-hidden="true" />}
        </div>
      </header>
      <div
        className={cn(
          laneClassName,
          isDesktop
            ? 'px-8 pb-16 pt-32'
            : cn('px-6 pt-24', contentBottomPadding),
        )}
      >
        {children}
        {isDesktop ? (
          <EditorActionErrorMessage
            actionError={actionError}
            className="mt-6"
            id={actionErrorId}
          />
        ) : null}
      </div>
      {!isDesktop ? (
        <footer className="fixed bottom-[var(--visual-viewport-bottom-offset,0px)] left-0 right-0 z-40 bg-gradient-to-t from-background via-background/90 to-transparent pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4">
          <div className={cn(mobileLaneClassName, 'px-6')}>
            {submitButton}
            <EditorActionErrorMessage actionError={actionError} id={actionErrorId} />
          </div>
        </footer>
      ) : null}
    </main>
  )
}

const EditorSubmitButton = ({
  actionError,
  actionErrorId,
  actionLabel,
  isSubmitting,
  showSubmitSpinner,
  variant,
  onSubmit,
}: {
  actionError?: EditorActionError | null
  actionErrorId?: string
  actionLabel: string
  isSubmitting: boolean
  showSubmitSpinner: boolean
  variant: 'desktop' | 'mobile'
  onSubmit: () => void
}) => (
  <Button
    aria-busy={isSubmitting || undefined}
    aria-describedby={actionErrorId}
    className={cn(
      'type-action bg-primary text-primary-foreground transition-[background-color,opacity,transform] hover:bg-primary/90 disabled:opacity-50',
      variant === 'desktop'
        ? 'h-12 rounded-full px-7'
        : 'h-auto w-full whitespace-normal rounded-full py-5 active:scale-[0.98]',
    )}
    disabled={isSubmitting}
    type="button"
    variant="default"
    onClick={onSubmit}
  >
    {showSubmitSpinner ? (
      <PendingSpinner decorative className="size-4" />
    ) : actionError ? (
      <CircleAlert aria-hidden="true" className="size-5 shrink-0" />
    ) : null}
    {actionLabel}
  </Button>
)
