// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import type { MockApiDependencies, ProductMockControllers } from '../../../controllers.ts'

export const newSearchContentController = (
  deps: MockApiDependencies,
): Pick<ProductMockControllers, "searchContent"> => ({
  searchContent: async (input) => deps.searchService.searchContent(input.body),
})
