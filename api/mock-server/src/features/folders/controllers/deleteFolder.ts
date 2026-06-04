// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import type { MockApiDependencies, ProductMockControllers } from '../../../controllers.ts'

export const newDeleteFolderController = (
  deps: MockApiDependencies,
): Pick<ProductMockControllers, "deleteFolder"> => ({
  deleteFolder: async (input) => deps.foldersService.deleteFolder(input.path.folderId),
})
