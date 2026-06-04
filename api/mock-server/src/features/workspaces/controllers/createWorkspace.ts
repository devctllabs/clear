// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import type { MockApiDependencies, ProductMockControllers } from '../../../controllers.ts'

export const newCreateWorkspaceController = (
  deps: MockApiDependencies,
): Pick<ProductMockControllers, "createWorkspace"> => ({
  createWorkspace: async (input) => deps.workspacesService.createWorkspace(input.body),
})
