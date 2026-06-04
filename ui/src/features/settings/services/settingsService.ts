import type { DomainResult } from '@shared/errors'

import type { Settings } from '../types/settings.types'

export interface SettingsService {
  getDefaults(): DomainResult<Settings>
  read(): DomainResult<Settings>
  reset(): DomainResult<Settings>
  write(settings: Settings): DomainResult<Settings>
}
