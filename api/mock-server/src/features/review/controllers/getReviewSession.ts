// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import type { MockApiDependencies, ProductMockControllers } from '../../../controllers.ts'

export const newGetReviewSessionController = (
  deps: MockApiDependencies,
): Pick<ProductMockControllers, "getReviewSession"> => ({
  getReviewSession: async (input) => deps.reviewService.getReviewSession(input.path.reviewId),
})
