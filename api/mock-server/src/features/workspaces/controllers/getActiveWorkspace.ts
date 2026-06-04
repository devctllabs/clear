// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import type { MockApiDependencies, ProductMockControllers } from '../../../controllers.ts'

export const newGetActiveWorkspaceController = (
  deps: MockApiDependencies,
): Pick<ProductMockControllers, "getActiveWorkspace"> => ({
  getActiveWorkspace: async () => deps.workspacesService.getActiveWorkspace(),
})
