// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import type { MockApiDependencies, ProductMockControllers } from '../../../controllers.ts'

export const newEmptyTrashController = (
  deps: MockApiDependencies,
): Pick<ProductMockControllers, "emptyTrash"> => ({
  emptyTrash: async () => deps.trashService.emptyTrash(),
})
