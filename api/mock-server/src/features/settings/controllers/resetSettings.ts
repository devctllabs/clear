// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import type { MockApiDependencies, ProductMockControllers } from '../../../controllers.ts'

export const newResetSettingsController = (
  deps: MockApiDependencies,
): Pick<ProductMockControllers, "resetSettings"> => ({
  resetSettings: async () => deps.settingsService.resetSettings(),
})
