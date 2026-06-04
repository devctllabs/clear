// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import type { MockApiDependencies, ProductMockControllers } from '../../../controllers.ts'

export const newUpdateNoteController = (
  deps: MockApiDependencies,
): Pick<ProductMockControllers, "updateNote"> => ({
  updateNote: async (input) => deps.notesService.updateNote(input.path.noteId, input.body),
})
