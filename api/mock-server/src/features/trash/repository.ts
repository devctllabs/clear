import type { TrashStateRecord, TrashItem } from '../../generated/mock-admin/contract/index.ts'
import { notFound } from '../../generated/clear-web-api/mock-runtime.ts'
import type { MockStateRepository } from '../../generated/mock-admin/state/repository.ts'

export class TrashRepository {
  constructor(private readonly stateStore: MockStateRepository) {}

  get() {
    return this.stateStore.getSlice('trash')
  }

  set(trash: TrashStateRecord) {
    this.stateStore.setSlice('trash', trash)
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

  addItem(item: TrashItem) {
    const trash = this.get()

    this.stateStore.setSlice('trash', {
      ...trash,
      items: [item, ...trash.items.filter((candidate) => candidate.id !== item.id)],
    })

    return this.get()
  }

  removeItem(itemId: string) {
    const trash = this.get()

    this.stateStore.setSlice('trash', {
      ...trash,
      items: trash.items.filter((item) => item.id !== itemId),
    })

    return this.get()
  }

  empty(lastEmptiedAt: string) {
    this.stateStore.setSlice('trash', {
      items: [],
      lastEmptiedAt,
    })

    return this.get()
  }
}
