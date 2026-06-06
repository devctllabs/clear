import type { TrashService } from '@features/trash/services/trashService'
import type { TrashState } from '@features/trash/types/trash.types'
import { mockApi } from '@platform/mock/mockApi'
import { toMockDomainResult, toMockVoidDomainResult } from '@platform/mock/mockDomainResult'

export const mockTrashService: TrashService = {
  async deleteItem(itemId) {
    return toMockVoidDomainResult(() => mockApi.trashService.deleteTrashItem(itemId))
  },
  async empty() {
    return toMockDomainResult(() => mockApi.trashService.emptyTrash(), toTrashState)
  },
  async list() {
    return toMockDomainResult(() => mockApi.trashService.getTrash(), toTrashState)
  },
  async restoreItem(itemId) {
    return toMockVoidDomainResult(() => mockApi.trashService.restoreTrashItem(itemId))
  },
}

const toTrashState = (trash: unknown): TrashState => trash as TrashState
