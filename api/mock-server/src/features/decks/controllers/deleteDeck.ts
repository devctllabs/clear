// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import type { MockApiDependencies, ProductMockControllers } from '../../../controllers.ts'

export const newDeleteDeckController = (
  deps: MockApiDependencies,
): Pick<ProductMockControllers, "deleteDeck"> => ({
  deleteDeck: async (input) => deps.decksService.deleteDeck(input.path.deckId),
})
