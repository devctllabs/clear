// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import type { SeedContext } from '../../generated/mock-admin/state/seed.ts'
import type { DeckRecord, MockState } from '../../generated/mock-admin/contract/index.ts'
import { seedNoteRecords } from '../notes/seed.ts'
import { summarizeDeckNotes } from './stats.ts'

export const seedDecks = (context: SeedContext): Pick<MockState, "decks"> => ({
  decks: buildSeedDecks(context),
})

type SeedDeckBase = Omit<DeckRecord, 'dueToday' | 'progress' | 'totalNotes'>

const buildSeedDecks = (context: SeedContext): MockState['decks'] => {
  const notes = seedNoteRecords(context)
  const decks: SeedDeckBase[] = [
    {
      description: 'Judgment traps worth reviewing until they become visible in the moment.',
      icon: 'brain',
      id: 'cognitive-biases',
      parentId: 'independent-study',
      title: 'Cognitive Biases',
      updatedAt: context.fromSeedNow(-(5 / 24)),
      workspaceId: 'independent-study',
    },
    {
      description: 'Turning points, institutions, and broad patterns that repay repeated review.',
      icon: 'book-open',
      id: 'world-history',
      parentId: 'independent-study',
      title: 'World History',
      updatedAt: context.fromSeedNow(-(9 / 24)),
      workspaceId: 'independent-study',
    },
    {
      description: 'Core institutions, ideas, and recurring arguments in political theory.',
      icon: 'landmark',
      id: 'political-thought',
      parentId: 'independent-study',
      title: 'Political Thought',
      updatedAt: context.fromSeedNow(-1),
      workspaceId: 'independent-study',
    },
    {
      description: 'Base-rate reasoning and small quantitative concepts for everyday study decisions.',
      icon: 'graduation-cap',
      id: 'statistics-basics',
      parentId: 'reference',
      title: 'Statistics Basics',
      updatedAt: context.fromSeedNow(-3),
      workspaceId: 'independent-study',
    },
  ]

  return decks.map((deck) => ({
    ...deck,
    ...summarizeDeckNotes(
      notes.filter((note) => note.deckId === deck.id),
      context.seedNow,
    ),
  }))
}
