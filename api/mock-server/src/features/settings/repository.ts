import { clone } from '../../lib/clone.ts'
import type { MockStateStore } from '../../lib/stateStore.ts'
import type { SettingsRecord } from '../../generated/mock-admin/contract/index.ts'
import { DEFAULT_SETTINGS } from './defaults.ts'

export class SettingsRepository {
  private readonly stateStore: MockStateStore

  constructor(stateStore: MockStateStore) {
    this.stateStore = stateStore
  }

  get() {
    return this.stateStore.getSlice('settings')
  }

  async set(settings: SettingsRecord) {
    await this.stateStore.setSlice('settings', clone(settings))
    return this.get()
  }

  async reset() {
    return this.set(clone(DEFAULT_SETTINGS))
  }
}
