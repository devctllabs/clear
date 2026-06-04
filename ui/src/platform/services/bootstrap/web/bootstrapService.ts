import { bootstrap as apiBootstrap } from '@api-generated/clear-api'

import type { BootstrapService } from '@features/bootstrap'
import type { BootstrapResult } from '@shared/lib/runtime-profile'
import { toDomainResult } from '@shared/services/api/sdk-result'

export const webBootstrapService: BootstrapService = {
  async bootstrap(options) {
    return toDomainResult(
      apiBootstrap(options?.signal ? { signal: options.signal } : undefined),
      (result) => result as BootstrapResult,
      'Bootstrap failed.',
    )
  },
}
