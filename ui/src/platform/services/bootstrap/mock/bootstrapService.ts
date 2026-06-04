import type { BootstrapService } from '@features/bootstrap'
import { ok } from '@shared/errors'
import { createBootstrapResult } from '@shared/lib/runtime-profile'

export const mockBootstrapService: BootstrapService = {
  async bootstrap() {
    return ok(createBootstrapResult())
  },
}
