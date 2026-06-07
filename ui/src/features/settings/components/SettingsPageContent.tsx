import type { ThemePreference } from '@core/theme'
import { getDocumentLocale } from '@core/i18n'
import { Button } from '@shared/components/ui/button'
import { useTranslation } from 'react-i18next'

import {
  SettingsDropdownRow,
  SettingsNumberRow,
  SettingsRow,
  SettingsSliderRow,
} from './SettingsRows'
import { SettingsSection } from './SettingsSection'
import { SettingsThemeSegmentedControl } from './SettingsThemeSegmentedControl'
import {
  settingsLanguageOptions,
  settingsNewCardsOrderOptions,
} from '../constants/settings-options'
import { showSettingsLanguageControl } from '../constants/settings-ui'
import type { Settings } from '../types/settings.types'
import { isDefaultSettingsFsrsParams } from '../utils/fsrs-params'
import {
  formatTimezoneDisplayName,
  settingsTimezoneLabelMap,
} from '../utils/timezone-options'

export const SettingsPageContent = ({
  settings,
  themePreference,
  onOpenFsrsParamsEditor,
  onOpenResetDialog,
  onOpenTimezonePicker,
  onThemePreferenceChange,
  onUpdateSettings,
}: {
  settings: Settings
  themePreference: ThemePreference
  onOpenFsrsParamsEditor: () => void
  onOpenResetDialog: () => void
  onOpenTimezonePicker: () => void
  onThemePreferenceChange: (theme: ThemePreference) => void
  onUpdateSettings: (patch: Partial<Settings>) => void
}) => (
  <SettingsPageContentInner
    settings={settings}
    themePreference={themePreference}
    onOpenFsrsParamsEditor={onOpenFsrsParamsEditor}
    onOpenResetDialog={onOpenResetDialog}
    onOpenTimezonePicker={onOpenTimezonePicker}
    onThemePreferenceChange={onThemePreferenceChange}
    onUpdateSettings={onUpdateSettings}
  />
)

const SettingsPageContentInner = ({
  settings,
  themePreference,
  onOpenFsrsParamsEditor,
  onOpenResetDialog,
  onOpenTimezonePicker,
  onThemePreferenceChange,
  onUpdateSettings,
}: {
  settings: Settings
  themePreference: ThemePreference
  onOpenFsrsParamsEditor: () => void
  onOpenResetDialog: () => void
  onOpenTimezonePicker: () => void
  onThemePreferenceChange: (theme: ThemePreference) => void
  onUpdateSettings: (patch: Partial<Settings>) => void
}) => {
  const { t } = useTranslation()
  const newCardsOrderOptions = settingsNewCardsOrderOptions.map((option) => ({
    ...option,
    label:
      option.value === 'before_review'
        ? t(($) => $.settings.options.newCardsBeforeReviews)
        : option.value === 'after_review'
          ? t(($) => $.settings.options.newCardsAfterReviews)
          : t(($) => $.settings.options.newCardsMixed),
  }))

  return (
    <div className="space-y-6">
      <SettingsSection title={t(($) => $.settings.labels.general)}>
        {showSettingsLanguageControl ? (
          <SettingsDropdownRow
            description={t(($) => $.settings.rows.languageDescription)}
            label={t(($) => $.settings.labels.language)}
            options={settingsLanguageOptions}
            value={getDocumentLocale(settings.language)}
            onSelect={(language) => {
              onUpdateSettings({ language })
            }}
          />
        ) : null}
        <SettingsRow
          chevron
          description={t(($) => $.settings.rows.timezoneDescription)}
          label={t(($) => $.settings.labels.timezone)}
          value={
            settings.timezone === 'auto'
              ? t(($) => $.settings.labels.automatic)
              : settingsTimezoneLabelMap.get(settings.timezone) ??
                formatTimezoneDisplayName(settings.timezone)
          }
          onClick={onOpenTimezonePicker}
        />
      </SettingsSection>

      <SettingsSection title={t(($) => $.settings.labels.appearance)}>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-6 py-5">
          <div className="min-w-0 flex-1">
            <p className="type-row-title text-foreground">
              {t(($) => $.settings.labels.theme)}
            </p>
          </div>
          <SettingsThemeSegmentedControl
            theme={themePreference}
            onThemeChange={onThemePreferenceChange}
          />
        </div>
      </SettingsSection>

      <SettingsSection title={t(($) => $.settings.labels.study)}>
        <SettingsNumberRow
          description={t(($) => $.settings.rows.newCardsPerDayDescription)}
          label={t(($) => $.settings.labels.newCardsPerDay)}
          value={settings.dailyNewLimit}
          onChange={(dailyNewLimit) => {
            onUpdateSettings({ dailyNewLimit })
          }}
        />
        <SettingsNumberRow
          description={t(($) => $.settings.rows.reviewCardsPerDayDescription)}
          label={t(($) => $.settings.labels.reviewCardsPerDay)}
          value={settings.dailyReviewLimit}
          onChange={(dailyReviewLimit) => {
            onUpdateSettings({ dailyReviewLimit })
          }}
        />
        <SettingsDropdownRow
          description={t(($) => $.settings.rows.newCardOrderDescription)}
          label={t(($) => $.settings.labels.newCardOrder)}
          options={newCardsOrderOptions}
          value={settings.newCardsOrder}
          onSelect={(newCardsOrder) => {
            onUpdateSettings({ newCardsOrder })
          }}
        />
      </SettingsSection>

      <SettingsSection title={t(($) => $.settings.labels.schedule)}>
        <SettingsSliderRow
          description={t(($) => $.settings.rows.targetRecallProbabilityDescription)}
          label={t(($) => $.settings.labels.targetRecallProbability)}
          value={settings.fsrsRetention}
          onChange={(fsrsRetention) => {
            onUpdateSettings({ fsrsRetention })
          }}
        />
        <SettingsNumberRow
          description={t(($) => $.settings.rows.masteryHorizonDescription)}
          label={t(($) => $.settings.labels.masteryHorizon)}
          value={settings.masteryHorizonDays}
          onChange={(masteryHorizonDays) => {
            onUpdateSettings({ masteryHorizonDays })
          }}
        />
        <SettingsRow
          chevron
          description={t(($) => $.settings.rows.fsrsDescription)}
          label={t(($) => $.settings.labels.fsrsParameters)}
          value={
            isDefaultSettingsFsrsParams(settings.fsrsParams)
              ? t(($) => $.common.labels.default)
              : t(($) => $.common.labels.custom)
          }
          onClick={onOpenFsrsParamsEditor}
        />
      </SettingsSection>

      <SettingsResetSection className="pt-2" onReset={onOpenResetDialog} />
    </div>
  )
}

const SettingsResetSection = ({
  className,
  onReset,
}: {
  className: string
  onReset: () => void
}) => (
  <SettingsResetSectionContent className={className} onReset={onReset} />
)

const SettingsResetSectionContent = ({
  className,
  onReset,
}: {
  className: string
  onReset: () => void
}) => {
  const { t } = useTranslation()

  return (
    <section aria-label={t(($) => $.settings.labels.settingsReset)} className={className}>
      <Button
        className="type-action h-12 w-full rounded-full border border-border bg-card uppercase text-muted-foreground hover:bg-muted hover:text-foreground"
        type="button"
        variant="outline"
        onClick={onReset}
      >
        {t(($) => $.settings.actions.resetAll)}
      </Button>
    </section>
  )
}
