// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import type { MockApiDependencies, ProductMockControllers } from '../../../controllers.ts'

export const newRestoreTrashItemController = (
  deps: MockApiDependencies,
): Pick<ProductMockControllers, "restoreTrashItem"> => ({
  restoreTrashItem: async (input) => deps.trashService.restoreTrashItem(input.path.itemId),
})
