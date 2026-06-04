// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import type { MockApiDependencies, ProductMockControllers } from '../../../controllers.ts'

export const newUpdateWorkspaceController = (
  deps: MockApiDependencies,
): Pick<ProductMockControllers, "updateWorkspace"> => ({
  updateWorkspace: async (input) => deps.workspacesService.updateWorkspace(input.path.workspaceId, input.body),
})
