// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import type { MockApiDependencies, ProductMockControllers } from '../../../controllers.ts'

export const newUpdateDeckController = (
  deps: MockApiDependencies,
): Pick<ProductMockControllers, "updateDeck"> => ({
  updateDeck: async (input) => deps.decksService.updateDeck(input.path.deckId, input.body),
})
