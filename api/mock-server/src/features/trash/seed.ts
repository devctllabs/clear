// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import type { SeedContext } from '../../generated/mock-admin/state/seed.ts'
import type { MockState } from '../../generated/mock-admin/contract/index.ts'

export const seedTrash = (context: SeedContext): Pick<MockState, "trash"> => ({
  trash: {
    items: [
      {
        deletedAt: context.fromSeedNow(-17),
        id: 'base-rates',
        kind: 'note',
        locationPath: ['Independent Study', 'Reference', 'Statistics Basics'],
        title: 'Base Rates',
      },
    ],
    lastEmptiedAt: context.fromSeedNow(-30),
  },
})
