// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import type { MockApiDependencies, ProductMockControllers } from '../../../controllers.ts'

export const newGetNoteController = (
  deps: MockApiDependencies,
): Pick<ProductMockControllers, "getNote"> => ({
  getNote: async (input) => deps.notesService.getNote(input.path.noteId),
})
