import type { SettingsService } from '@features/settings/services/settingsService'
import type { Settings } from '@features/settings/types/settings.types'
import { mockApi } from '@platform/mock/mockApi'
import { toMockDomainResult } from '@platform/mock/mockDomainResult'

export const mockSettingsService: SettingsService = {
  async getDefaults() {
    return toMockDomainResult(
      () => mockApi.settingsService.getDefaultSettings(),
      toSettings,
    )
  },
  async read() {
    return toMockDomainResult(() => mockApi.settingsService.getSettings(), toSettings)
  },
  async reset() {
    return toMockDomainResult(() => mockApi.settingsService.resetSettings(), toSettings)
  },
  async write(settings) {
    return toMockDomainResult(
      () => mockApi.settingsService.updateSettings(settings),
      toSettings,
    )
  },
}

const toSettings = (settings: unknown): Settings => settings as Settings
