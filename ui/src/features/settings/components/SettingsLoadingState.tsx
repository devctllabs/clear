import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { SkeletonBlock } from '@shared/components/feedback/SkeletonBlock'
import { SectionHeading } from '@shared/components/layout/Screen'
import { Card } from '@shared/components/ui/card'
import { cn } from '@shared/lib/utils'

const SettingsRowSkeleton = ({
  chevron = true,
  valueClassName = 'w-24',
}: {
  chevron?: boolean
  valueClassName?: string
}) => (
  <div className="flex items-center justify-between gap-4 px-6 py-5">
    <div className="min-w-0 space-y-2">
      <SkeletonBlock className="h-5 w-full max-w-[10rem]" />
      <SkeletonBlock className="h-3.5 w-full max-w-[14rem]" />
    </div>
    <div className="flex shrink-0 items-center gap-2">
      <SkeletonBlock className={cn('h-10 rounded-full', valueClassName)} />
      {chevron ? <SkeletonBlock className="size-4.5" /> : null}
    </div>
  </div>
)

const SettingsSliderRowSkeleton = () => (
  <div className="px-6 py-5">
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1 space-y-2">
        <SkeletonBlock className="h-5 w-full max-w-[12rem]" />
        <SkeletonBlock className="h-3.5 w-full max-w-[16rem]" />
      </div>
      <SkeletonBlock className="h-10 w-24 shrink-0 rounded-full" />
    </div>
    <div className="mt-4 flex items-center gap-3">
      <SkeletonBlock className="h-2 flex-1" />
      <SkeletonBlock className="size-5 shrink-0" />
    </div>
  </div>
)

const SettingsThemeRowSkeleton = () => (
  <div className="flex items-center justify-between gap-4 px-6 py-5">
    <SkeletonBlock className="h-5 w-20" />
    <div className="flex shrink-0 rounded-full bg-muted p-1">
      <SkeletonBlock className="h-8 w-16" />
      <SkeletonBlock className="ml-1 h-8 w-16" />
    </div>
  </div>
)

const SettingsSectionSkeleton = ({
  children,
  title,
}: {
  children: ReactNode
  title: string
}) => (
  <section className="space-y-4">
    <SectionHeading>{title}</SectionHeading>
    <Card className="overflow-hidden rounded-card border border-border bg-card py-0 shadow-card">
      {children}
    </Card>
  </section>
)

const GeneralSettingsSkeleton = () => {
  const { t } = useTranslation()

  return (
    <SettingsSectionSkeleton title={t(($) => $.settings.labels.general)}>
      <SettingsRowSkeleton valueClassName="w-24" />
      <div className="mx-6 border-t border-border/60" />
      <SettingsRowSkeleton valueClassName="w-20" />
    </SettingsSectionSkeleton>
  )
}

const AppearanceSettingsSkeleton = () => {
  const { t } = useTranslation()

  return (
    <SettingsSectionSkeleton title={t(($) => $.settings.labels.appearance)}>
      <SettingsThemeRowSkeleton />
    </SettingsSectionSkeleton>
  )
}

const StudySettingsSkeleton = () => {
  const { t } = useTranslation()

  return (
    <SettingsSectionSkeleton title={t(($) => $.settings.labels.study)}>
      <SettingsRowSkeleton chevron={false} valueClassName="w-24" />
      <div className="mx-6 border-t border-border/60" />
      <SettingsRowSkeleton chevron={false} valueClassName="w-24" />
      <div className="mx-6 border-t border-border/60" />
      <SettingsRowSkeleton valueClassName="w-28" />
    </SettingsSectionSkeleton>
  )
}

const ScheduleSettingsSkeleton = () => {
  const { t } = useTranslation()

  return (
    <SettingsSectionSkeleton title={t(($) => $.settings.labels.schedule)}>
      <SettingsSliderRowSkeleton />
      <div className="mx-6 border-t border-border/60" />
      <SettingsRowSkeleton chevron={false} valueClassName="w-24" />
      <div className="mx-6 border-t border-border/60" />
      <SettingsRowSkeleton valueClassName="w-24" />
    </SettingsSectionSkeleton>
  )
}

const ResetSettingsSkeleton = () => (
  <div className="pt-2">
    <SkeletonBlock className="h-12 w-full rounded-full" />
  </div>
)

export const SettingsLoadingState = () => {
  const { t } = useTranslation()

  return (
    <section
      aria-label={t(($) => $.settings.labels.loadingSettings)}
      aria-live="polite"
      className="w-full min-w-0"
      role="status"
    >
      <div aria-hidden="true" className="space-y-6">
        <GeneralSettingsSkeleton />
        <AppearanceSettingsSkeleton />
        <StudySettingsSkeleton />
        <ScheduleSettingsSkeleton />
        <ResetSettingsSkeleton />
      </div>
    </section>
  )
}
