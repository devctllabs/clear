import type { ThemePreference } from '@core/theme'
import { Button } from '@shared/components/ui/button'

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
  <div className="space-y-6">
    <SettingsSection title="General">
      {showSettingsLanguageControl ? (
        <SettingsDropdownRow
          description="Interface language"
          label="Language"
          options={settingsLanguageOptions}
          value={settings.language}
          onSelect={(language) => {
            onUpdateSettings({ language })
          }}
        />
      ) : null}
      <SettingsRow
        chevron
        description="Use automatic timezone or choose a city."
        label="Timezone"
        value={
          settings.timezone === 'auto'
            ? 'Automatic'
            : settingsTimezoneLabelMap.get(settings.timezone) ??
              formatTimezoneDisplayName(settings.timezone)
        }
        onClick={onOpenTimezonePicker}
      />
    </SettingsSection>

    <SettingsSection title="Appearance">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-6 py-5">
        <div className="min-w-0 flex-1">
          <p className="type-row-title text-foreground">
            Theme
          </p>
        </div>
        <SettingsThemeSegmentedControl
          theme={themePreference}
          onThemeChange={onThemePreferenceChange}
        />
      </div>
    </SettingsSection>

    <SettingsSection title="Study">
      <SettingsNumberRow
        description="Maximum new cards per day"
        label="New cards per day"
        value={settings.dailyNewLimit}
        onChange={(dailyNewLimit) => {
          onUpdateSettings({ dailyNewLimit })
        }}
      />
      <SettingsNumberRow
        description="Maximum review cards per day"
        label="Review cards per day"
        value={settings.dailyReviewLimit}
        onChange={(dailyReviewLimit) => {
          onUpdateSettings({ dailyReviewLimit })
        }}
      />
      <SettingsDropdownRow
        description="Order new cards relative to reviews"
        label="New card order"
        options={settingsNewCardsOrderOptions}
        value={settings.newCardsOrder}
        onSelect={(newCardsOrder) => {
          onUpdateSettings({ newCardsOrder })
        }}
      />
    </SettingsSection>

    <SettingsSection title="Schedule">
      <SettingsSliderRow
        description="Minimum probability of recall at the next scheduled review"
        label="Target recall probability"
        value={settings.fsrsRetention}
        onChange={(fsrsRetention) => {
          onUpdateSettings({ fsrsRetention })
        }}
      />
      <SettingsNumberRow
        description="Days a card must stay recallable at or above the target probability to count as mastered"
        label="Mastery horizon"
        value={settings.masteryHorizonDays}
        onChange={(masteryHorizonDays) => {
          onUpdateSettings({ masteryHorizonDays })
        }}
      />
      <SettingsRow
        chevron
        description="Expert model weights"
        label="FSRS Parameters"
        value={isDefaultSettingsFsrsParams(settings.fsrsParams) ? 'Default' : 'Custom'}
        onClick={onOpenFsrsParamsEditor}
      />
    </SettingsSection>

    <SettingsResetSection className="pt-2" onReset={onOpenResetDialog} />
  </div>
)

const SettingsResetSection = ({
  className,
  onReset,
}: {
  className: string
  onReset: () => void
}) => (
  <section aria-label="Settings reset" className={className}>
    <Button
      className="type-action h-12 w-full rounded-full border border-border bg-card uppercase text-muted-foreground hover:bg-muted hover:text-foreground"
      type="button"
      variant="outline"
      onClick={onReset}
    >
      Reset all settings
    </Button>
  </section>
)
