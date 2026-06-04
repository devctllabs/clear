// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import type { SeedContext } from '../../generated/mock-admin/state/seed.ts'
import type { MockState } from '../../generated/mock-admin/contract/index.ts'

export const seedFolders = (context: SeedContext): Pick<MockState, "folders"> => ({
  folders: [
    {
      description: 'Topic notes, excerpts, and outlines for active study.',
      id: 'reading-notes',
      name: 'Reading Notes',
      parentId: 'independent-study',
      updatedAt: context.fromSeedNow(-9),
      workspaceId: 'independent-study',
    },
    {
      description: 'Frameworks, summaries, and reusable study scaffolds.',
      id: 'reference',
      name: 'Reference',
      parentId: 'independent-study',
      updatedAt: context.fromSeedNow(-8),
      workspaceId: 'independent-study',
    },
    {
      description: 'Timelines, turning points, and historical reading notes.',
      id: 'history',
      name: 'History',
      parentId: 'reading-notes',
      updatedAt: context.fromSeedNow(-7),
      workspaceId: 'independent-study',
    },
  ],
})
