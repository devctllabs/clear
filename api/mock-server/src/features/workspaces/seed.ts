// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import type { SeedContext } from '../../generated/mock-admin/state/seed.ts'
import type { MockState } from '../../generated/mock-admin/contract/index.ts'

export const seedWorkspaces = (context: SeedContext): Pick<MockState, "workspaces" | "activeWorkspace" | "idCounters"> => ({
  workspaces: [
    {
      description: 'Reading notes, review decks, and reference material for ongoing study.',
      icon: 'layers-3',
      id: 'independent-study',
      title: 'Independent Study',
      updatedAt: context.fromSeedNow(-10),
    },
    {
      description: 'Completed decks, older notes, and material worth keeping.',
      icon: 'books',
      id: 'reading-archive',
      title: 'Reading Archive',
      updatedAt: context.fromSeedNow(-12),
    },
  ],
  activeWorkspace: {
    workspaceId: 'independent-study',
  },
  idCounters: {},
})
