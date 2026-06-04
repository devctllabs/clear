// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import type { MockApiDependencies, ProductMockControllers } from '../../../controllers.ts'

export const newCreateNoteController = (
  deps: MockApiDependencies,
): Pick<ProductMockControllers, "createNote"> => ({
  createNote: async (input) => deps.notesService.createNote(input.body),
})
