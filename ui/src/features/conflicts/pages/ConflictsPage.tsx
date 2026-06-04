import { CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { BottomNav } from '@shared/components/layout/BottomNav'
import {
  DesktopPageHeader,
  DesktopPageLayout,
} from '@shared/components/layout/DesktopShell'
import {
  AppShell,
  PageHeader,
  ScreenCanvas,
  SectionHeading,
} from '@shared/components/layout/Screen'
import { Card } from '@shared/components/ui/card'
import { useActiveWorkspaceId } from '@features/workspaces/hooks/useWorkspaces'
import { useIsDesktopLayout } from '@shared/hooks/useAppLayoutMode'

export const ConflictsPage = () => {
  const { t } = useTranslation()
  const activeWorkspaceIdQuery = useActiveWorkspaceId()
  const homeTarget = activeWorkspaceIdQuery.data
    ? { to: `/dashboard/${activeWorkspaceIdQuery.data}` }
    : { to: '/workspaces' }
  const isDesktop = useIsDesktopLayout()

  if (isDesktop) {
    return (
      <DesktopPageLayout activeItem="conflicts" homeTarget={homeTarget}>
        <DesktopPageHeader title={t(($) => $.menu.conflicts.title)} />
        <ConflictsPlaceholder />
      </DesktopPageLayout>
    )
  }

  return (
    <AppShell>
      <ScreenCanvas>
        <PageHeader backTo="/menu" title={t(($) => $.menu.conflicts.title)} />
        <ConflictsPlaceholder />
      </ScreenCanvas>
      <BottomNav activeItem="menu" homeTarget={homeTarget} />
    </AppShell>
  )
}

const ConflictsPlaceholder = () => {
  const { t } = useTranslation()

  return (
    <Card className="rounded-card border border-border bg-card p-6 shadow-card">
      <div className="flex min-w-0 items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
          <CheckCircle2 className="size-5 stroke-[2.2]" />
        </span>
        <div className="min-w-0">
          <SectionHeading>{t(($) => $.menu.conflicts.heading)}</SectionHeading>
          <p className="text-wrap-anywhere type-study-title mt-2 text-foreground">
            {t(($) => $.menu.conflicts.noConflicts)}
          </p>
          <p className="text-wrap-anywhere mt-2 text-sm leading-6 text-muted-foreground">
            {t(($) => $.menu.conflicts.description)}
          </p>
        </div>
      </div>
    </Card>
  )
}
