import type { ReviewSessionRecord } from '../../generated/mock-admin/contract/index.ts'
import { notFound } from '../../generated/clear-web-api/mock-runtime.ts'
import type { MockStateRepository } from '../../generated/mock-admin/state/repository.ts'

export class ReviewRepository {
  constructor(private readonly stateStore: MockStateRepository) {}

  all() {
    return this.stateStore.getSlice('reviewSessions')
  }

  find(reviewId: string) {
    return this.all().find((session) => session.id === reviewId)
  }

  require(reviewId: string) {
    const session = this.find(reviewId)

    if (!session) {
      throw notFound('review session', reviewId)
    }

    return session
  }

  create(session: ReviewSessionRecord) {
    this.stateStore.setSlice('reviewSessions', [session, ...this.all()])
    return session
  }

  update(reviewId: string, updater: (session: ReviewSessionRecord) => ReviewSessionRecord) {
    let next: ReviewSessionRecord | undefined

    this.stateStore.setSlice('reviewSessions', this.all().map((session) => {
      if (session.id !== reviewId) {
        return session
      }

      next = updater(session)

      return next
    }))

    return next ?? this.require(reviewId)
  }

}
