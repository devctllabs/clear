import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { LoadErrorState } from '@shared/components/feedback/LoadErrorState'
import { useIsDesktopLayout } from '@shared/hooks/useAppLayoutMode'
import { cn } from '@shared/lib/utils'

import { BackControl } from './Screen'
import { desktopEditorLaneClassName, editorLaneClassName } from './LayoutLane'

export const EditorErrorState = ({
  backTo,
  error,
  errorTitle,
  title,
  onRetry,
}: {
  backTo: string
  error: unknown
  errorTitle?: string
  title: string
  onRetry?: () => void
}) => {
  const { t } = useTranslation()
  const isDesktop = useIsDesktopLayout()
  const laneClassName = isDesktop ? desktopEditorLaneClassName : editorLaneClassName

  return (
    <main id="main-content" className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <header className="fixed top-0 z-50 w-full bg-background/95 backdrop-blur-md">
        <div
          className={cn(
            laneClassName,
            isDesktop
              ? 'flex h-auto items-center gap-4 px-8 py-6'
              : 'grid h-16 grid-cols-[44px_1fr_44px] items-center px-6',
          )}
        >
          <BackControl
            ariaLabel={t(($) => $.navigation.actions.closeEditor)}
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
          {!isDesktop ? <div aria-hidden="true" /> : null}
        </div>
      </header>
      <div
        className={cn(
          laneClassName,
          isDesktop ? 'px-8 pb-16 pt-32' : 'px-6 pb-32 pt-24',
        )}
      >
        <LoadErrorState error={error} title={errorTitle ?? title} onRetry={onRetry} />
      </div>
    </main>
  )
}
