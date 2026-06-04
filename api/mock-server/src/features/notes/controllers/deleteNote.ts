// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import type { MockApiDependencies, ProductMockControllers } from '../../../controllers.ts'

export const newDeleteNoteController = (
  deps: MockApiDependencies,
): Pick<ProductMockControllers, "deleteNote"> => ({
  deleteNote: async (input) => deps.notesService.deleteNote(input.path.noteId),
})
