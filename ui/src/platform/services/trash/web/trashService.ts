import {
  deleteTrashItem as apiDeleteTrashItem,
  emptyTrash as apiEmptyTrash,
  getTrash as apiGetTrash,
  restoreTrashItem as apiRestoreTrashItem,
} from '@api-generated/clear-api'
import type { TrashState as ApiTrashState } from '@api-generated/clear-api'

import type { TrashService } from '@features/trash/services/trashService'
import type { TrashState } from '@features/trash/types/trash.types'
import {
  toDomainResult,
  toVoidDomainResult,
} from '@shared/services/api/sdk-result'

export const webTrashService: TrashService = {
  deleteItem(itemId) {
    return toVoidDomainResult(
      apiDeleteTrashItem({ path: { itemId } }),
      'Failed to delete trash item.',
    )
  },
  empty() {
    return toDomainResult(
      apiEmptyTrash(),
      toTrashState,
      'Failed to empty trash.',
    )
  },
  list() {
    return toDomainResult(
      apiGetTrash(),
      toTrashState,
      'Failed to load trash.',
    )
  },
  restoreItem(itemId) {
    return toVoidDomainResult(
      apiRestoreTrashItem({ path: { itemId } }),
      'Failed to restore trash item.',
    )
  },
}

const toTrashState = (trash: ApiTrashState): TrashState => trash
