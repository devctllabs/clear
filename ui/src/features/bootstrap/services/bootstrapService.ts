import type { DomainResult } from '@shared/errors'
import type { BootstrapResult } from '@shared/lib/runtime-profile'

export type BootstrapOptions = {
  signal?: AbortSignal
}

export interface BootstrapService {
  bootstrap(options?: BootstrapOptions): DomainResult<BootstrapResult>
}
