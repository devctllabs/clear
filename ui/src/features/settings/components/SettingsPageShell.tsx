import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { BottomNav, type NavigationTarget } from '@shared/components/layout/BottomNav'
import {
  DesktopPageHeader,
  DesktopPageLayout,
} from '@shared/components/layout/DesktopShell'
import { AppShell, PageHeader, ScreenCanvas } from '@shared/components/layout/Screen'

export const SettingsPageShell = ({
  children,
  homeTarget,
  isDesktop,
  rightSlot,
  screenClassName,
}: {
  children?: ReactNode
  homeTarget: NavigationTarget
  isDesktop: boolean
  rightSlot?: ReactNode
  screenClassName?: string
}) => {
  const { t } = useTranslation()

  if (isDesktop) {
    return (
      <DesktopPageLayout
        activeItem="settings"
        contentClassName="mx-auto w-full max-w-page-narrow"
        homeTarget={homeTarget}
      >
        <DesktopPageHeader rightSlot={rightSlot} title={t(($) => $.settings.labels.settings)} />
        {children}
      </DesktopPageLayout>
    )
  }

  return (
    <AppShell>
      <ScreenCanvas className={screenClassName}>
        <PageHeader backTo="/menu" rightSlot={rightSlot} title={t(($) => $.settings.labels.settings)} />
        {children}
      </ScreenCanvas>
      <BottomNav activeItem="menu" homeTarget={homeTarget} />
    </AppShell>
  )
}
