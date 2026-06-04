import type { DomainResult } from '@shared/errors'

import type { TrashState } from '../types/trash.types'

export interface TrashService {
  deleteItem(itemId: string): DomainResult<void>
  empty(): DomainResult<TrashState>
  list(): DomainResult<TrashState>
  restoreItem(itemId: string): DomainResult<void>
}
