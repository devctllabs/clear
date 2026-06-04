// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import type { MockApiDependencies, ProductMockControllers } from '../../../controllers.ts'

export const newUpdateSettingsController = (
  deps: MockApiDependencies,
): Pick<ProductMockControllers, "updateSettings"> => ({
  updateSettings: async (input) => deps.settingsService.updateSettings(input.body),
})
