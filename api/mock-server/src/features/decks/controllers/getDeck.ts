// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import type { MockApiDependencies, ProductMockControllers } from '../../../controllers.ts'

export const newGetDeckController = (
  deps: MockApiDependencies,
): Pick<ProductMockControllers, "getDeck"> => ({
  getDeck: async (input) => deps.decksService.getDeck(input.path.deckId),
})
