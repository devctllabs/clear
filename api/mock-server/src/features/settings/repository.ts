import { clone } from '../../lib/clone.ts'
import type { MockStateRepository } from '../../generated/mock-admin/state/repository.ts'
import type { SettingsRecord } from '../../generated/mock-admin/contract/index.ts'
import { DEFAULT_SETTINGS } from './defaults.ts'

export class SettingsRepository {
  constructor(private readonly stateStore: MockStateRepository) {}

  get() {
    return this.stateStore.getSlice('settings')
  }

  set(settings: SettingsRecord) {
    this.stateStore.setSlice('settings', clone(settings))
    return this.get()
  }

  reset() {
    return this.set(clone(DEFAULT_SETTINGS))
  }
}
