// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import type { MockApiDependencies, ProductMockControllers } from '../../../controllers.ts'

export const newGetFolderController = (
  deps: MockApiDependencies,
): Pick<ProductMockControllers, "getFolder"> => ({
  getFolder: async (input) => deps.foldersService.getFolder(input.path.folderId),
})
