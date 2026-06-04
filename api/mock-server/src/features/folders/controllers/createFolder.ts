// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import type { MockApiDependencies, ProductMockControllers } from '../../../controllers.ts'

export const newCreateFolderController = (
  deps: MockApiDependencies,
): Pick<ProductMockControllers, "createFolder"> => ({
  createFolder: async (input) => deps.foldersService.createFolder(input.body),
})
