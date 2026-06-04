// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import type { MockApiDependencies, ProductMockControllers } from '../../../controllers.ts'

export const newCreateDeckController = (
  deps: MockApiDependencies,
): Pick<ProductMockControllers, "createDeck"> => ({
  createDeck: async (input) => deps.decksService.createDeck(input.body),
})
