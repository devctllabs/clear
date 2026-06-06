import type { TrashStateRecord, TrashItem } from '../../generated/mock-admin/contract/index.ts'
import { notFound } from '../../generated/clear-web-api/mock-runtime.ts'
import type { MockStateStore } from '../../lib/stateStore.ts'

export class TrashRepository {
  private readonly stateStore: MockStateStore

  constructor(stateStore: MockStateStore) {
    this.stateStore = stateStore
  }

  get() {
    return this.stateStore.getSlice('trash')
  }

  async set(trash: TrashStateRecord) {
    await this.stateStore.setSlice('trash', trash)
    return this.get()
  }

  requireItem(itemId: string) {
    const item = this.get().items.find((candidate) => candidate.id === itemId)

    if (!item) {
      throw notFound('trash item', itemId)
    }

    return item
  }

  findItem(itemId: string) {
    return this.get().items.find((candidate) => candidate.id === itemId)
  }

  async addItem(item: TrashItem) {
    const trash = this.get()

    await this.stateStore.setSlice('trash', {
      ...trash,
      items: [item, ...trash.items.filter((candidate) => candidate.id !== item.id)],
    })

    return this.get()
  }

  async removeItem(itemId: string) {
    const trash = this.get()

    await this.stateStore.setSlice('trash', {
      ...trash,
      items: trash.items.filter((item) => item.id !== itemId),
    })

    return this.get()
  }

  async empty(lastEmptiedAt: string) {
    await this.stateStore.setSlice('trash', {
      items: [],
      lastEmptiedAt,
    })

    return this.get()
  }
}
