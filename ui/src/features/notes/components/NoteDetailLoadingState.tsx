import { SkeletonBlock } from '@shared/components/feedback/SkeletonBlock'
import { useTranslation } from 'react-i18next'
import { BottomNav, type NavigationTarget } from '@shared/components/layout/BottomNav'
import {
  mobileFooterActionSkeletonClassName,
  mobileLaneClassName,
} from '@shared/components/layout/LayoutLane'
import { cn } from '@shared/lib/utils'

export const NoteDetailLoadingState = ({
  homeTarget,
}: {
  homeTarget: NavigationTarget
}) => (
  <NoteDetailLoadingContent homeTarget={homeTarget} />
)

const NoteDetailLoadingContent = ({
  homeTarget,
}: {
  homeTarget: NavigationTarget
}) => {
  const { t } = useTranslation()

  return (
  <main id="main-content" className="min-h-screen overflow-x-hidden bg-background">
    <section aria-label={t(($) => $.notes.labels.loadingNote)} aria-live="polite" role="status">
      <div aria-hidden="true">
        <header className="fixed inset-x-0 top-0 z-50 w-full bg-background/95 backdrop-blur-md">
          <div className={cn(mobileLaneClassName, 'px-6 pb-2 pt-12')}>
            <div className="grid min-h-11 grid-cols-[44px_1fr_44px] items-center">
              <SkeletonBlock className="size-11" />
              <SkeletonBlock className="mx-auto h-5 w-28 rounded-[0.625rem]" />
              <SkeletonBlock className="size-11" />
            </div>
          </div>
        </header>

        <section className={cn(mobileLaneClassName, 'min-h-screen px-6 pb-32 pt-28')}>
          <article className="min-w-0 overflow-hidden rounded-card border border-border bg-card shadow-card">
            <div className="px-8 pt-8">
              <div className="flex min-w-0 flex-wrap gap-2">
                <SkeletonBlock className="h-6 w-16" />
                <SkeletonBlock className="h-6 w-24" />
              </div>
            </div>

            <div className="px-8 pb-8 pt-8">
              <SkeletonBlock className="h-3 w-12" />
              <SkeletonBlock className="mt-4 h-7 w-full max-w-[15rem] rounded-[0.875rem]" />
            </div>

            <hr className="mx-8 border-t border-border" />

            <div className="px-8 py-8">
              <SkeletonBlock className="h-3 w-16" />
              <div className="mt-4 space-y-3">
                <SkeletonBlock className="h-5 w-full" />
                <SkeletonBlock className="h-5 w-11/12" />
                <SkeletonBlock className="h-5 w-2/3" />
              </div>
            </div>

            <hr className="mx-8 border-t border-border" />

            <div className="px-8 py-8">
              <SkeletonBlock className="h-3 w-14" />
              <div className="mt-4 space-y-3">
                <SkeletonBlock className="h-5 w-full" />
                <SkeletonBlock className="h-5 w-5/6" />
                <SkeletonBlock className="h-5 w-3/4" />
              </div>
            </div>

            <hr className="mx-8 border-t border-border" />

            <div className="px-8 py-8">
              <div className="mb-6 flex min-w-0 items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-2">
                  <SkeletonBlock className="h-3 w-20" />
                  <SkeletonBlock className="h-7 w-14 rounded-[0.875rem]" />
                </div>
                <SkeletonBlock className="h-6 w-28 shrink-0" />
              </div>
              <SkeletonBlock className="h-1.5 w-full" />
            </div>
          </article>
        </section>

        <div className="fixed bottom-20 left-0 right-0 z-40 bg-gradient-to-t from-background via-background/80 to-transparent pb-6 pt-2">
          <div className={cn(mobileLaneClassName, 'px-6')}>
            <SkeletonBlock
              className={mobileFooterActionSkeletonClassName}
              data-slot="mobile-footer-action-skeleton"
            />
          </div>
        </div>
      </div>
    </section>
    <BottomNav activeItem="home" homeTarget={homeTarget} />
  </main>
  )
}
