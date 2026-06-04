// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import type { MockApiDependencies, ProductMockControllers } from '../../../controllers.ts'

export const newListNotesByDeckController = (
  deps: MockApiDependencies,
): Pick<ProductMockControllers, "listNotesByDeck"> => ({
  listNotesByDeck: async (input) => deps.notesService.listNotesByDeck(input.path.deckId, input.query),
})
