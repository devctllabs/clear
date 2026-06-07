import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  BottomActionErrorStatus,
  desktopBottomStatusStackClassName,
} from '@shared/components/feedback/BottomActionErrorStatus'
import { getDocumentLocale } from '@core/i18n'
import { useThemeStore } from '@core/theme'
import { LoadErrorState } from '@shared/components/feedback/LoadErrorState'
import { PendingSpinner } from '@shared/components/feedback/PendingSpinner'
import { useDelayedBoolean } from '@shared/hooks/useDelayedBoolean'
import { useActiveWorkspaceId } from '@features/workspaces/hooks/useWorkspaces'
import { useIsDesktopLayout } from '@shared/hooks/useAppLayoutMode'

import { SettingsFsrsParamsDialog } from '../components/SettingsFsrsParamsDialog'
import { SettingsLoadingState } from '../components/SettingsLoadingState'
import { SettingsPageContent } from '../components/SettingsPageContent'
import { SettingsPageShell } from '../components/SettingsPageShell'
import { SettingsResetDialog } from '../components/SettingsResetDialog'
import { SettingsTimezonePickerDialog } from '../components/SettingsTimezonePickerDialog'
import {
  useResetSettings,
  useSettings,
  useWriteSettings,
} from '../hooks/useSettings'
import type { Settings } from '../types/settings.types'

export const SettingsPage = () => {
  const { i18n, t } = useTranslation()
  const activeWorkspaceIdQuery = useActiveWorkspaceId()
  const homeTarget = activeWorkspaceIdQuery.data
    ? { to: `/dashboard/${activeWorkspaceIdQuery.data}` }
    : { to: '/workspaces' }
  const isDesktop = useIsDesktopLayout()
  const settingsQuery = useSettings()
  const writeSettings = useWriteSettings()
  const resetSettings = useResetSettings()
  const themePreference = useThemeStore((state) => state.preference)
  const setThemePreference = useThemeStore((state) => state.setPreference)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [isTimezonePickerOpen, setIsTimezonePickerOpen] = useState(false)
  const [isFsrsParamsEditorOpen, setIsFsrsParamsEditorOpen] = useState(false)
  const [isResetSettingsDialogOpen, setIsResetSettingsDialogOpen] = useState(false)
  const openResetSettingsDialog = () => {
    resetSettings.reset()
    setIsResetSettingsDialogOpen(true)
  }
  const closeResetSettingsDialog = () => {
    setIsResetSettingsDialogOpen(false)
    resetSettings.reset()
  }

  useEffect(() => {
    if (settingsQuery.data) {
      setSettings(settingsQuery.data)
      void i18n.changeLanguage(getDocumentLocale(settingsQuery.data.language))
    }
  }, [i18n, settingsQuery.data])

  const isInitialLoading = settingsQuery.isLoading || (!settings && !settingsQuery.isError)
  const showInitialLoading = useDelayedBoolean(isInitialLoading, 180)
  const showWritePending = useDelayedBoolean(writeSettings.isPending, 450)

  if (showInitialLoading) {
    return (
      <SettingsPageShell homeTarget={homeTarget} isDesktop={isDesktop}>
        <SettingsLoadingState />
      </SettingsPageShell>
    )
  }

  if (isInitialLoading) {
    return <SettingsPageShell homeTarget={homeTarget} isDesktop={isDesktop} />
  }

  if (settingsQuery.isError && !settings) {
    return (
      <SettingsPageShell homeTarget={homeTarget} isDesktop={isDesktop}>
        <LoadErrorState
          error={settingsQuery.error}
          title={t(($) => $.settings.errors.settingsCouldNotLoad)}
          onRetry={() => {
            void settingsQuery.refetch()
          }}
        />
      </SettingsPageShell>
    )
  }

  if (!settings) {
    return (
      <SettingsPageShell homeTarget={homeTarget} isDesktop={isDesktop}>
        <LoadErrorState
          error={t(($) => $.settings.errors.settingsUnavailable)}
          title={t(($) => $.settings.errors.settingsCouldNotLoad)}
          onRetry={() => {
            void settingsQuery.refetch()
          }}
        />
      </SettingsPageShell>
    )
  }

  const updateSettings = (patch: Partial<Settings>) => {
    const nextSettings = { ...settings, ...patch }

    setSettings(nextSettings)
    if (typeof patch.language === 'string') {
      void i18n.changeLanguage(getDocumentLocale(patch.language))
    }
    writeSettings.mutate(nextSettings)
  }

  const savingStatus = showWritePending ? (
    <span className="flex size-9 items-center justify-center rounded-full bg-card text-muted-foreground ring-1 ring-border">
      <PendingSpinner label={t(($) => $.settings.labels.savingSettings)} />
    </span>
  ) : undefined

  const settingsDialogs = (
    <>
      <SettingsTimezonePickerDialog
        open={isTimezonePickerOpen}
        value={settings.timezone}
        onOpenChange={setIsTimezonePickerOpen}
        onSelect={(timezone) => {
          updateSettings({ timezone })
        }}
      />
      <SettingsFsrsParamsDialog
        open={isFsrsParamsEditorOpen}
        value={settings.fsrsParams}
        onOpenChange={setIsFsrsParamsEditorOpen}
        onSave={(fsrsParams) => {
          updateSettings({ fsrsParams })
        }}
      />
    </>
  )

  return (
    <>
      <SettingsPageShell
        homeTarget={homeTarget}
        isDesktop={isDesktop}
        rightSlot={savingStatus}
        screenClassName={writeSettings.isError ? 'pb-52' : undefined}
      >
        <SettingsPageContent
          settings={settings}
          themePreference={themePreference}
          onOpenFsrsParamsEditor={() => {
            setIsFsrsParamsEditorOpen(true)
          }}
          onOpenResetDialog={openResetSettingsDialog}
          onOpenTimezonePicker={() => {
            setIsTimezonePickerOpen(true)
          }}
          onThemePreferenceChange={setThemePreference}
          onUpdateSettings={updateSettings}
        />
        {settingsDialogs}
      </SettingsPageShell>

      <SettingsResetDialog
        actionError={
          resetSettings.isError
            ? { error: resetSettings.error, title: t(($) => $.settings.errors.couldNotResetSettings) }
            : null
        }
        confirming={resetSettings.isPending}
        open={isResetSettingsDialogOpen}
        onConfirm={() => {
          resetSettings.mutate(undefined, {
            onSuccess: (nextSettings) => {
              setSettings(nextSettings)
              void i18n.changeLanguage(getDocumentLocale(nextSettings.language))
              setIsResetSettingsDialogOpen(false)
            },
          })
        }}
        onOpenChange={(open) => {
          if (!open) {
            closeResetSettingsDialog()
            return
          }

          setIsResetSettingsDialogOpen(true)
        }}
      />
      <BottomActionErrorStatus
        className={isDesktop ? desktopBottomStatusStackClassName : undefined}
        error={writeSettings.isError ? writeSettings.error : null}
        title={t(($) => $.settings.errors.couldNotSaveSettings)}
      />
    </>
  )
}
