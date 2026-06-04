// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import type { MockApiDependencies, ProductMockControllers } from '../../../controllers.ts'

export const newStartReviewSessionController = (
  deps: MockApiDependencies,
): Pick<ProductMockControllers, "startReviewSession"> => ({
  startReviewSession: async (input) => deps.reviewService.startReviewSession(input.path.deckId),
})
