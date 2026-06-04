import { invoke } from '@tauri-apps/api/core'

import type { BootstrapService } from '@features/bootstrap'
import { abortable } from '@shared/lib/abort'
import { err, ok } from '@shared/errors'
import type { BootstrapResult } from '@shared/lib/runtime-profile'
import { mapTauriErrorToDomainError } from '@platform/tauri/tauri-error'

export const tauriBootstrapService: BootstrapService = {
  async bootstrap({ signal } = {}) {
    try {
      const result = await abortable(invoke<BootstrapResult>('bootstrap'), signal)

      return ok(result)
    } catch (error) {
      if (signal?.aborted) {
        throw error
      }

      return err(mapTauriErrorToDomainError(error, 'Bootstrap failed.'))
    }
  },
}
