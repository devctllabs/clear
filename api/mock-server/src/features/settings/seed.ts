// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import type { SeedContext } from '../../generated/mock-admin/state/seed.ts'
import type { MockState } from '../../generated/mock-admin/contract/index.ts'
import { DEFAULT_SETTINGS } from './defaults.ts'

export const seedSettings = (_context: SeedContext): Pick<MockState, "settings"> => ({
  settings: DEFAULT_SETTINGS,
})
