import type { ReviewSessionRecord } from '../../generated/mock-admin/contract/index.ts'
import { notFound } from '../../generated/clear-web-api/mock-runtime.ts'
import type { MockStateStore } from '../../lib/stateStore.ts'

export class ReviewRepository {
  private readonly stateStore: MockStateStore

  constructor(stateStore: MockStateStore) {
    this.stateStore = stateStore
  }

  all() {
    return this.stateStore.findEntities('reviewSessions')
  }

  find(reviewId: string) {
    return this.stateStore.findEntity('reviewSessions', reviewId)
  }

  require(reviewId: string) {
    const session = this.find(reviewId)

    if (!session) {
      throw notFound('review session', reviewId)
    }

    return session
  }

  async create(session: ReviewSessionRecord) {
    return this.stateStore.createEntity('reviewSessions', session, { prepend: true })
  }

  async update(reviewId: string, updater: (session: ReviewSessionRecord) => ReviewSessionRecord) {
    return (
      await this.stateStore.updateEntity('reviewSessions', reviewId, updater)
    ) ?? this.require(reviewId)
  }
}
