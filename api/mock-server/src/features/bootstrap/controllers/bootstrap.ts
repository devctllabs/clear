// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import type { MockApiDependencies, ProductMockControllers } from '../../../controllers.ts'

export const newBootstrapController = (
  _deps: MockApiDependencies,
): Pick<ProductMockControllers, "bootstrap"> => ({
  bootstrap: async () => ({
    runtimeProfile: {
      formFactor: 'desktop',
      runtime: 'web',
    },
  }),
})
