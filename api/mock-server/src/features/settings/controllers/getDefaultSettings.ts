// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import type { MockApiDependencies, ProductMockControllers } from '../../../controllers.ts'

export const newGetDefaultSettingsController = (
  deps: MockApiDependencies,
): Pick<ProductMockControllers, "getDefaultSettings"> => ({
  getDefaultSettings: async () => deps.settingsService.getDefaultSettings(),
})
