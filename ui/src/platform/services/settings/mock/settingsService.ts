import type { SettingsService } from '@features/settings/services/settingsService'
import { ok } from '@shared/errors'
import { defaultSettings, mockAppDataStore } from '@platform/mock/mockAppDataStore'

export const mockSettingsService: SettingsService = {
  async getDefaults() {
    return ok(defaultSettings())
  },
  async read() {
    return ok(mockAppDataStore.getSettings())
  },
  async reset() {
    return ok(mockAppDataStore.resetSettings())
  },
  async write(settings) {
    return ok(mockAppDataStore.writeSettings(settings))
  },
}
