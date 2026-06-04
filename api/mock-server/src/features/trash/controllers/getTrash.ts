// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import type { MockApiDependencies, ProductMockControllers } from '../../../controllers.ts'

export const newGetTrashController = (
  deps: MockApiDependencies,
): Pick<ProductMockControllers, "getTrash"> => ({
  getTrash: async () => deps.trashService.getTrash(),
})
