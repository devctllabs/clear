import { Settings2, Trash2, ChevronRight } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { Card } from '@shared/components/ui/card'
import { BottomNav } from '@shared/components/layout/BottomNav'
import { AppShell, PageHeader, ScreenCanvas } from '@shared/components/layout/Screen'
import { useActiveWorkspaceId } from '@features/workspaces/hooks/useWorkspaces'

const sections = [
  {
    icon: <Settings2 className="size-5 stroke-[2.2]" />,
    id: 'settings',
    to: '/menu/settings',
  },
  {
    icon: <Trash2 className="size-5 stroke-[2.2]" />,
    id: 'trash',
    to: '/menu/trash',
  },
] as const

export const MenuPage = () => {
  const { t } = useTranslation()
  const activeWorkspaceIdQuery = useActiveWorkspaceId()
  const homeTarget = activeWorkspaceIdQuery.data
    ? { to: `/dashboard/${activeWorkspaceIdQuery.data}` }
    : { to: '/workspaces' }

  return (
    <AppShell>
      <ScreenCanvas>
        <PageHeader title={t(($) => $.menu.labels.menu)} />
        <Card className="overflow-hidden rounded-card border border-border bg-card py-0 shadow-card">
          {sections.map((section, index) => (
            <div key={section.id}>
              <Link
                className="flex w-full min-w-0 items-center gap-4 px-6 py-5 text-left transition-colors hover:bg-accent"
                to={section.to}
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
                  {section.icon}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="text-wrap-anywhere type-row-title min-w-0 text-foreground">
                      {section.id === 'settings'
                        ? t(($) => $.menu.sections.settings.title)
                        : t(($) => $.menu.sections.trash.title)}
                    </span>
                  </div>
                  <p className="text-wrap-anywhere mt-0.5 max-w-[18rem] text-[13px] leading-5 text-muted-foreground">
                    {section.id === 'settings'
                      ? t(($) => $.menu.sections.settings.description)
                      : t(($) => $.menu.sections.trash.description)}
                  </p>
                </div>

                <ChevronRight className="size-4.5 shrink-0 text-muted-foreground/45" />
              </Link>
              {index < sections.length - 1 ? (
                <div className="mx-6 border-t border-border/60" />
              ) : null}
            </div>
          ))}
        </Card>
      </ScreenCanvas>
      <BottomNav
        activeItem="menu"
        homeTarget={homeTarget}
      />
    </AppShell>
  )
}
