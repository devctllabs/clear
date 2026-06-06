import type { SettingsRecord } from '../../generated/mock-admin/contract/index.ts'
import { DEFAULT_SETTINGS } from './defaults.ts'
import { SettingsRepository } from './repository.ts'
import type { MockStateStore } from '../../lib/stateStore.ts'

export class SettingsService {
  private readonly settings: SettingsRepository
  private readonly stateStore: MockStateStore

  constructor(
    settings: SettingsRepository,
    stateStore: MockStateStore,
  ) {
    this.settings = settings
    this.stateStore = stateStore
  }

  getSettings() {
    return this.settings.get()
  }

  async updateSettings(settings: SettingsRecord) {
    return this.stateStore.transaction(() => this.settings.set(settings))
  }

  getDefaultSettings() {
    return DEFAULT_SETTINGS
  }

  async resetSettings() {
    return this.stateStore.transaction(() => this.settings.reset())
  }
}
