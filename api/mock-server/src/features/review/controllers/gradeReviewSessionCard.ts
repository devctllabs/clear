// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import type { MockApiDependencies, ProductMockControllers } from '../../../controllers.ts'

export const newGradeReviewSessionCardController = (
  deps: MockApiDependencies,
): Pick<ProductMockControllers, "gradeReviewSessionCard"> => ({
  gradeReviewSessionCard: async (input) =>
    deps.reviewService.gradeReviewSessionCard(input.path.reviewId, input.path.cardId, input.body.grade),
})
