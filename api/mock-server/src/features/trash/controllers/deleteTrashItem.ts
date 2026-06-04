// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import type { MockApiDependencies, ProductMockControllers } from '../../../controllers.ts'

export const newDeleteTrashItemController = (
  deps: MockApiDependencies,
): Pick<ProductMockControllers, "deleteTrashItem"> => ({
  deleteTrashItem: async (input) => deps.trashService.deleteTrashItem(input.path.itemId),
})
