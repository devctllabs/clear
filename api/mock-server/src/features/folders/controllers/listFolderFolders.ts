// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import type { MockApiDependencies, ProductMockControllers } from '../../../controllers.ts'

export const newListFolderFoldersController = (
  deps: MockApiDependencies,
): Pick<ProductMockControllers, "listFolderFolders"> => ({
  listFolderFolders: async (input) => deps.foldersService.listFolderFolders(input.path.folderId, input.query),
})
