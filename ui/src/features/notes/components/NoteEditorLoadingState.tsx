import { X } from 'lucide-react'

import { SkeletonBlock } from '@shared/components/feedback/SkeletonBlock'
import {
  desktopEditorLaneClassName,
  editorLaneClassName,
  mobileFooterActionSkeletonClassName,
  mobileLaneClassName,
} from '@shared/components/layout/LayoutLane'
import { BackControl } from '@shared/components/layout/Screen'
import { useIsDesktopLayout } from '@shared/hooks/useAppLayoutMode'
import { cn } from '@shared/lib/utils'
import type { NoteKind } from '../types/note.types'

export const NoteEditorLoadingState = ({
  activeKind = 'basic',
  backTo,
  title = 'Loading note editor',
}: {
  activeKind?: NoteKind
  backTo: string
  title?: string
}) => {
  const isDesktop = useIsDesktopLayout()
  const laneClassName = isDesktop ? desktopEditorLaneClassName : editorLaneClassName

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
              ariaLabel="Close editor"
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
              {title}
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
        aria-label="Loading note editor"
        aria-live="polite"
        className={cn(
          laneClassName,
          isDesktop ? 'px-8 pb-16 pt-32' : 'px-6 pb-32 pt-24',
          !isDesktop && activeKind === 'cloze' && 'pb-48',
        )}
        role="status"
      >
        <div aria-hidden="true">
          <div className="mb-6 flex justify-center">
            <div className="inline-flex rounded-full bg-muted p-1 ring-1 ring-border">
              <SkeletonBlock className="h-10 w-28 rounded-full" />
              <SkeletonBlock className="ml-1 h-10 w-28 rounded-full" />
            </div>
          </div>

          {activeKind === 'basic' ? (
            <section className="overflow-hidden rounded-card border border-border bg-card shadow-card">
              <div className="px-8 pb-8 pt-8">
                <SkeletonBlock className="h-3 w-14" />
                <div className="mt-4 min-h-20 space-y-3">
                  <SkeletonBlock className="h-9 w-full max-w-[18rem] rounded-[1.125rem]" />
                  <SkeletonBlock className="h-8 w-full max-w-[12rem] rounded-[1rem]" />
                </div>
              </div>
              <hr className="mx-8 border-t border-border" />
              <div className="px-8 pt-8">
                <SkeletonBlock className="h-3 w-16" />
                <div className="mt-4 min-h-36 space-y-3">
                  <SkeletonBlock className="h-5 w-full max-w-[30rem]" />
                  <SkeletonBlock className="h-5 w-5/6 max-w-[24rem]" />
                </div>
              </div>
              <hr className="mx-8 border-t border-border" />
              <div className="px-8 py-8">
                <SkeletonBlock className="h-3 w-14" />
                <div className="mt-4 min-h-36 space-y-3">
                  <SkeletonBlock className="h-5 w-4/5 max-w-[24rem]" />
                  <SkeletonBlock className="h-5 w-2/3 max-w-[18rem]" />
                </div>
                <div className="mt-6 flex flex-wrap gap-2 pb-1">
                  {Array.from({ length: 5 }, (_, index) => (
                    <SkeletonBlock className="size-10 rounded-full" key={index} />
                  ))}
                </div>
              </div>
            </section>
          ) : (
            <div className="space-y-6">
              <section className="overflow-hidden rounded-card border border-border bg-card shadow-card">
                <div className="px-8 pb-8 pt-8">
                  <SkeletonBlock className="h-3 w-14" />
                  <div className="mt-4 min-h-20 space-y-3">
                    <SkeletonBlock className="h-9 w-full max-w-[18rem] rounded-[1.125rem]" />
                    <SkeletonBlock className="h-8 w-full max-w-[12rem] rounded-[1rem]" />
                  </div>
                </div>
                <hr className="mx-8 border-t border-border" />
                <div className="px-8 py-8">
                  <SkeletonBlock className="h-3 w-24" />
                  <div className="mt-4 min-h-48 space-y-3">
                    <SkeletonBlock className="h-5 w-full max-w-[32rem]" />
                    <SkeletonBlock className="h-5 w-11/12 max-w-[28rem]" />
                    <SkeletonBlock className="h-5 w-3/4 max-w-[22rem]" />
                  </div>
                  <div className="mt-6 flex flex-wrap gap-2 pb-1">
                    {Array.from({ length: 6 }, (_, index) => (
                      <SkeletonBlock className="size-10 rounded-full" key={index} />
                    ))}
                  </div>
                </div>
              </section>
              <section className="overflow-hidden rounded-card border border-border bg-card p-6 shadow-card">
                <div className="flex items-start gap-4">
                  <SkeletonBlock className="size-10 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <SkeletonBlock className="h-5 w-full max-w-[13rem]" />
                    <div className="mt-3 space-y-2">
                      <SkeletonBlock className="h-4 w-full" />
                      <SkeletonBlock className="h-4 w-4/5" />
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
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
