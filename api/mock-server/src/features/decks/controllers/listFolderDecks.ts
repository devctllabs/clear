// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import type { MockApiDependencies, ProductMockControllers } from '../../../controllers.ts'

export const newListFolderDecksController = (
  deps: MockApiDependencies,
): Pick<ProductMockControllers, "listFolderDecks"> => ({
  listFolderDecks: async (input) => deps.decksService.listFolderDecks(input.path.folderId, input.query),
})
