// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import type { SeedContext } from '../../generated/mock-admin/state/seed.ts'
import type { MockState } from '../../generated/mock-admin/contract/index.ts'

export const seedReview = (context: SeedContext): Pick<MockState, "reviewSessions"> => ({
  reviewSessions: [
    {
      completedAt: context.fromSeedNow(-11),
      currentCard: null,
      deckId: 'cognitive-biases',
      durationSeconds: 1080,
      id: 'cognitive-biases-review',
      mode: 'due',
      plannedCount: 3,
      reviewedCount: 3,
      startedAt: context.fromSeedNow(-11),
      status: 'completed',
    },
  ],
})
