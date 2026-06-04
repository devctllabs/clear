import type { SettingsRecord } from '../../generated/mock-admin/contract/index.ts'
import { DEFAULT_SETTINGS } from './defaults.ts'
import { SettingsRepository } from './repository.ts'
import type { MockStateRepository } from '../../generated/mock-admin/state/repository.ts'

export class SettingsService {
  constructor(
    private readonly settings: SettingsRepository,
    private readonly stateStore: MockStateRepository,
  ) {}

  getSettings() {
    return this.settings.get()
  }

  updateSettings(settings: SettingsRecord) {
    return this.stateStore.transaction(() => this.settings.set(settings))
  }

  getDefaultSettings() {
    return DEFAULT_SETTINGS
  }

  resetSettings() {
    return this.stateStore.transaction(() => this.settings.reset())
  }
}
