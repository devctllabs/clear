// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import type { MockApiDependencies, ProductMockControllers } from '../../../controllers.ts'

export const newGetWorkspaceController = (
  deps: MockApiDependencies,
): Pick<ProductMockControllers, "getWorkspace"> => ({
  getWorkspace: async (input) => deps.workspacesService.getWorkspace(input.path.workspaceId),
})
