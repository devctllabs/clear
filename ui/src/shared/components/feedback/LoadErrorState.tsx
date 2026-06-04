import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { CircleAlert, RefreshCw } from 'lucide-react'

import {
  domainError,
  getUserMessage,
  isDomainError,
  type DomainError,
} from '@shared/errors'
import { cn } from '@shared/lib/utils'
import { Button } from '@shared/components/ui/button'
import { mobileLaneWidthClassName } from '@shared/components/layout/LayoutLane'

type LoadErrorVariant = 'fullscreen' | 'page' | 'section'

export const normalizeError = (
  error: unknown,
  fallbackMessage = 'Unexpected error',
): DomainError => {
  if (isDomainError(error)) {
    return error
  }

  if (error instanceof Error && error.message.trim()) {
    return domainError.unexpected(error.message.trim())
  }

  if (typeof error === 'string' && error.trim()) {
    return domainError.unexpected(error.trim())
  }

  return domainError.unexpected(fallbackMessage)
}

export const LoadErrorState = ({
  backLabel = 'Back',
  backTo,
  children,
  className,
  error,
  retryLabel = 'Try again',
  showRetry,
  title,
  variant = 'section',
  onRetry,
}: {
  backLabel?: string
  backTo?: string
  children?: ReactNode
  className?: string
  error: unknown
  retryLabel?: string
  showRetry?: boolean
  title: string
  variant?: LoadErrorVariant
  onRetry?: () => void
}) => {
  const normalizedError = normalizeError(error)
  const shouldShowRetry = Boolean(onRetry && (showRetry ?? normalizedError.retryable))
  const compactActions = variant === 'section'

  return (
    <section
      aria-live="assertive"
      className={cn(
        variant === 'fullscreen' &&
          'flex min-h-screen items-center justify-center bg-background px-6 text-foreground',
        variant === 'page' && 'flex min-h-[48vh] items-center justify-center',
        variant === 'section' && 'w-full',
        className,
      )}
      role="alert"
    >
      <div
        className={cn(
          'w-full rounded-card border border-border bg-card p-7 text-center shadow-card',
          variant === 'fullscreen' && mobileLaneWidthClassName,
          variant === 'page' && mobileLaneWidthClassName,
          variant === 'section' && 'max-w-full',
        )}
      >
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-foreground">
          <CircleAlert className="size-5 stroke-[2.2]" />
        </span>
        <h2 className="text-wrap-anywhere type-study-title mt-5 text-foreground">
          {title}
        </h2>
        <p className="text-wrap-anywhere mt-3 text-sm font-medium leading-6 text-muted-foreground">
          {getUserMessage(normalizedError)}
        </p>
        {children ? (
          <div className="text-wrap-anywhere mt-3 text-sm font-medium leading-6 text-muted-foreground">
            {children}
          </div>
        ) : null}
        {shouldShowRetry || backTo ? (
          <div className={cn('mt-7 flex flex-col gap-3', compactActions && 'items-center')}>
            {shouldShowRetry ? (
              <Button
                className={cn(
                  'type-action h-auto max-w-full rounded-full bg-primary text-primary-foreground transition-[opacity,transform] hover:opacity-90 active:scale-[0.98]',
                  compactActions ? 'min-w-36 px-6 py-3.5' : 'w-full py-4',
                )}
                type="button"
                variant="default"
                onClick={onRetry}
              >
                <RefreshCw aria-hidden="true" />
                {retryLabel}
              </Button>
            ) : null}
            {backTo ? (
              <Button
                asChild
                className={cn(
                  'type-action h-auto max-w-full rounded-full border border-border bg-card text-foreground shadow-none hover:bg-muted',
                  compactActions ? 'min-w-36 px-6 py-3.5' : 'w-full py-4',
                )}
                variant="outline"
              >
                <Link to={backTo as never}>{backLabel}</Link>
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}

export const InlineErrorState = ({
  className,
  error,
  title = 'Action failed',
}: {
  className?: string
  error: unknown
  title?: string
}) => {
  if (!error) {
    return null
  }

  const normalizedError = normalizeError(error)

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-card border border-border bg-card px-4 py-3 text-left shadow-card',
        className,
      )}
      role="alert"
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-wrap-anywhere type-label uppercase text-foreground">
          {title}
        </p>
        <p className="text-wrap-anywhere mt-1 text-sm font-medium leading-5 text-muted-foreground">
          {getUserMessage(normalizedError)}
        </p>
      </div>
    </div>
  )
}
