// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import type { MockApiDependencies, ProductMockControllers } from '../../../controllers.ts'

export const newListWorkspaceFoldersController = (
  deps: MockApiDependencies,
): Pick<ProductMockControllers, "listWorkspaceFolders"> => ({
  listWorkspaceFolders: async (input) => deps.foldersService.listWorkspaceFolders(input.path.workspaceId, input.query),
})
