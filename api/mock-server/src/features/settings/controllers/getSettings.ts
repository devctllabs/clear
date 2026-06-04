// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import type { MockApiDependencies, ProductMockControllers } from '../../../controllers.ts'

export const newGetSettingsController = (
  deps: MockApiDependencies,
): Pick<ProductMockControllers, "getSettings"> => ({
  getSettings: async () => deps.settingsService.getSettings(),
})
