// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import type { MockApiDependencies, ProductMockControllers } from '../../../controllers.ts'

export const newUpdateFolderController = (
  deps: MockApiDependencies,
): Pick<ProductMockControllers, "updateFolder"> => ({
  updateFolder: async (input) => deps.foldersService.updateFolder(input.path.folderId, input.body),
})
