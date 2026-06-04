// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import type { MockApiDependencies, ProductMockControllers } from '../../../controllers.ts'

export const newListWorkspaceDecksController = (
  deps: MockApiDependencies,
): Pick<ProductMockControllers, "listWorkspaceDecks"> => ({
  listWorkspaceDecks: async (input) => deps.decksService.listWorkspaceDecks(input.path.workspaceId, input.query),
})
