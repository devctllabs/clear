// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import type { MockApiDependencies, ProductMockControllers } from '../../../controllers.ts'

export const newDeleteWorkspaceController = (
  deps: MockApiDependencies,
): Pick<ProductMockControllers, "deleteWorkspace"> => ({
  deleteWorkspace: async (input) => deps.workspacesService.deleteWorkspace(input.path.workspaceId),
})
