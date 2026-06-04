// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import type { MockApiDependencies, ProductMockControllers } from '../../../controllers.ts'

export const newListWorkspacesController = (
  deps: MockApiDependencies,
): Pick<ProductMockControllers, "listWorkspaces"> => ({
  listWorkspaces: async () => deps.workspacesService.listWorkspaces(),
})
