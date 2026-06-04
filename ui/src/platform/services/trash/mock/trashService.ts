import type { TrashService } from '@features/trash/services/trashService'
import { ok } from '@shared/errors'
import { mockAppDataStore } from '@platform/mock/mockAppDataStore'

export const mockTrashService: TrashService = {
  async deleteItem(itemId) {
    mockAppDataStore.deleteTrashItem(itemId)

    return ok(undefined)
  },
  async empty() {
    return ok(mockAppDataStore.emptyTrash())
  },
  async list() {
    return ok(mockAppDataStore.listTrash())
  },
  async restoreItem(itemId) {
    mockAppDataStore.restoreTrashItem(itemId)

    return ok(undefined)
  },
}
