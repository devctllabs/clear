import {
  getDefaultSettings as apiGetDefaultSettings,
  getSettings as apiGetSettings,
  resetSettings as apiResetSettings,
  updateSettings as apiUpdateSettings,
} from '@api-generated/clear-api'
import type { Settings as ApiSettings } from '@api-generated/clear-api'

import type { SettingsService } from '@features/settings/services/settingsService'
import type { Settings } from '@features/settings/types/settings.types'
import { toDomainResult } from '@shared/services/api/sdk-result'

export const webSettingsService: SettingsService = {
  getDefaults() {
    return toDomainResult(
      apiGetDefaultSettings(),
      toSettings,
      'Failed to load default settings.',
    )
  },
  read() {
    return toDomainResult(
      apiGetSettings(),
      toSettings,
      'Failed to load settings.',
    )
  },
  reset() {
    return toDomainResult(
      apiResetSettings(),
      toSettings,
      'Failed to reset settings.',
    )
  },
  write(settings) {
    return toDomainResult(
      apiUpdateSettings({ body: settings as ApiSettings }),
      toSettings,
      'Failed to save settings.',
    )
  },
}

const toSettings = (settings: ApiSettings): Settings => settings
