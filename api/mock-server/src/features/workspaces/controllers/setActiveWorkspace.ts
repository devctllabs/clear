// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import type { MockApiDependencies, ProductMockControllers } from '../../../controllers.ts'

export const newSetActiveWorkspaceController = (
  deps: MockApiDependencies,
): Pick<ProductMockControllers, "setActiveWorkspace"> => ({
  setActiveWorkspace: async (input) => deps.workspacesService.setActiveWorkspace(input.body.workspaceId),
})
