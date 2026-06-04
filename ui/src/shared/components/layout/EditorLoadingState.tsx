import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { SkeletonBlock } from '@shared/components/feedback/SkeletonBlock'
import { useIsDesktopLayout } from '@shared/hooks/useAppLayoutMode'
import { cn } from '@shared/lib/utils'

import {
  desktopEditorLaneClassName,
  editorLaneClassName,
  mobileFooterActionSkeletonClassName,
  mobileLaneClassName,
} from './LayoutLane'
import { BackControl } from './Screen'

export type EditorLoadingFormKind = 'deck' | 'folder' | 'generic' | 'workspace'

export const EditorLoadingState = ({
  backTo,
  formKind = 'generic',
  title,
}: {
  backTo: string
  formKind?: EditorLoadingFormKind
  title?: string
}) => {
  const { t } = useTranslation()
  const isDesktop = useIsDesktopLayout()
  const laneClassName = isDesktop ? desktopEditorLaneClassName : editorLaneClassName
  const resolvedTitle = title ?? t(($) => $.common.labels.loadingEditor)

  return (
    <main id="main-content" className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <header className="fixed top-0 z-50 w-full bg-background/95 backdrop-blur-md">
        <div
          className={cn(
            laneClassName,
            isDesktop
              ? 'grid h-auto grid-cols-[minmax(0,1fr)_auto] items-center gap-6 px-8 py-6'
              : 'grid h-16 grid-cols-[44px_1fr_44px] items-center px-6',
          )}
        >
          <div className={cn(isDesktop ? 'flex min-w-0 items-center gap-4' : 'contents')}>
            <BackControl
              ariaLabel={t(($) => $.navigation.actions.closeEditor)}
              fallbackTo={backTo}
              icon={<X className="size-5" />}
            />
            <h1
              className={cn(
                'line-clamp-2 min-w-0 max-w-full break-all type-study-title text-foreground',
                isDesktop
                  ? 'text-left'
                  : 'text-center',
              )}
            >
              {resolvedTitle}
            </h1>
          </div>
          {isDesktop ? (
            <SkeletonBlock className="h-12 w-32 rounded-full" />
          ) : (
            <div aria-hidden="true" />
          )}
        </div>
      </header>

      <section
        aria-label={t(($) => $.common.labels.loadingEditor)}
        aria-live="polite"
        className={cn(
          laneClassName,
          isDesktop ? 'px-8 pb-16 pt-32' : 'px-6 pb-32 pt-24',
        )}
        role="status"
      >
        <EditorLoadingForm formKind={formKind} isDesktop={isDesktop} />
      </section>

      {!isDesktop ? (
        <footer className="fixed bottom-[var(--visual-viewport-bottom-offset,0px)] left-0 right-0 z-40 bg-gradient-to-t from-background via-background/90 to-transparent pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4">
          <div className={cn(mobileLaneClassName, 'px-6')}>
            <SkeletonBlock
              className={mobileFooterActionSkeletonClassName}
              data-slot="mobile-footer-action-skeleton"
            />
          </div>
        </footer>
      ) : null}
    </main>
  )
}

const EditorLoadingForm = ({
  formKind,
}: {
  formKind: EditorLoadingFormKind
  isDesktop: boolean
}) => {
  if (formKind === 'generic') {
    return <GenericEditorLoadingForm />
  }

  return <SpecificEditorLoadingForm formKind={formKind} />
}

const SpecificEditorLoadingForm = ({
  formKind,
}: {
  formKind: Exclude<EditorLoadingFormKind, 'generic'>
}) => (
  <div aria-hidden="true">
    <section className="overflow-hidden rounded-card border border-border bg-card shadow-card">
      {formKind === 'deck' || formKind === 'folder' ? (
        <div className="px-8 pt-8">
          <SkeletonBlock className="h-10 w-36 max-w-full rounded-full" />
        </div>
      ) : null}

      <div className="px-8 pt-8">
        <SkeletonBlock className="h-3 w-32" />
        <div className="mt-4 min-h-20 space-y-3">
          <SkeletonBlock className="h-9 w-full max-w-[20rem] rounded-[1.125rem]" />
          <SkeletonBlock className="h-8 w-full max-w-[13rem] rounded-[1rem]" />
        </div>
      </div>

      <hr className="mx-8 mt-8 border-t border-border" />

      <div className="px-8 py-8">
        <SkeletonBlock className="h-3 w-40" />
        <div className="mt-4 min-h-36 space-y-3">
          <SkeletonBlock className="h-5 w-full max-w-[30rem]" />
          <SkeletonBlock className="h-5 w-5/6 max-w-[25rem]" />
          <SkeletonBlock className="h-5 w-2/3 max-w-[18rem]" />
        </div>
      </div>

      {formKind === 'deck' || formKind === 'workspace' ? (
        <>
          <hr className="mx-8 border-t border-border" />
          <div className="px-8 py-8">
            <VisualPickerLoadingSkeleton />
          </div>
        </>
      ) : null}
    </section>
  </div>
)

const VisualPickerLoadingSkeleton = () => (
  <div className="space-y-4">
    <div className="space-y-2">
      <SkeletonBlock className="h-3 w-16" />
      <SkeletonBlock className="h-4 w-full max-w-[17rem]" />
    </div>
    <div className="flex items-center gap-3 rounded-card bg-card p-3">
      <SkeletonBlock className="size-16 shrink-0 rounded-full" />
      <div className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden pb-1">
        {Array.from({ length: 6 }, (_, index) => (
          <SkeletonBlock className="size-12 shrink-0 rounded-full" key={index} />
        ))}
      </div>
      <SkeletonBlock className="size-12 shrink-0 rounded-full" />
    </div>
  </div>
)

const GenericEditorLoadingForm = () => (
  <div aria-hidden="true" className="space-y-8">
    <section className="rounded-card border border-border bg-card p-8 shadow-card">
      <SkeletonBlock className="h-3 w-20" />
      <SkeletonBlock className="mt-4 h-10 w-full max-w-[15rem] rounded-compact" />
      <div className="mt-8 space-y-3">
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-5/6" />
        <SkeletonBlock className="h-4 w-2/3" />
      </div>
    </section>

    <section className="rounded-card border border-border bg-card p-8 shadow-card">
      <SkeletonBlock className="h-3 w-24" />
      <SkeletonBlock className="mt-4 h-10 w-full max-w-[11rem] rounded-compact" />
      <div className="mt-8 h-36 rounded-panel bg-muted p-4">
        <SkeletonBlock className="h-4 w-full bg-muted-foreground/30" />
        <SkeletonBlock className="mt-3 h-4 w-4/5 bg-muted-foreground/30" />
        <SkeletonBlock className="mt-3 h-4 w-2/3 bg-muted-foreground/30" />
      </div>
    </section>
  </div>
)
