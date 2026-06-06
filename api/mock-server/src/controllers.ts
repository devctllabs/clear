// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import {
  generatedRouteDefinitions as clearWebApiGeneratedRouteDefinitions,
  type GeneratedMockControllers as ClearWebApiGeneratedMockControllers,
} from './generated/clear-web-api/mock-runtime.ts'
import type { GeneratedMockControllers as AdminGeneratedMockControllers } from './generated/mock-admin/mock-runtime.ts'
import { seedState } from './generated/mock-admin/state/seed.ts'
import type { MockClock, MockState } from './generated/mock-admin/contract/index.ts'
import {
  newMockApiDependencies,
  type MockApiDependencies,
} from './dependencies.ts'
import {
  newFileMockStateStore,
  type MockStateOptions,
} from './lib/nodeStateStore.ts'
import type { MockStateStore } from './lib/stateStore.ts'
import { newBootstrapController } from './features/bootstrap/controllers/bootstrap.ts'
import { newListWorkspacesController } from './features/workspaces/controllers/listWorkspaces.ts'
import { newCreateWorkspaceController } from './features/workspaces/controllers/createWorkspace.ts'
import { newGetActiveWorkspaceController } from './features/workspaces/controllers/getActiveWorkspace.ts'
import { newSetActiveWorkspaceController } from './features/workspaces/controllers/setActiveWorkspace.ts'
import { newGetWorkspaceController } from './features/workspaces/controllers/getWorkspace.ts'
import { newUpdateWorkspaceController } from './features/workspaces/controllers/updateWorkspace.ts'
import { newDeleteWorkspaceController } from './features/workspaces/controllers/deleteWorkspace.ts'
import { newListWorkspaceFoldersController } from './features/folders/controllers/listWorkspaceFolders.ts'
import { newListFolderFoldersController } from './features/folders/controllers/listFolderFolders.ts'
import { newCreateFolderController } from './features/folders/controllers/createFolder.ts'
import { newGetFolderController } from './features/folders/controllers/getFolder.ts'
import { newUpdateFolderController } from './features/folders/controllers/updateFolder.ts'
import { newDeleteFolderController } from './features/folders/controllers/deleteFolder.ts'
import { newGetFolderPathController } from './features/folders/controllers/getFolderPath.ts'
import { newListWorkspaceDecksController } from './features/decks/controllers/listWorkspaceDecks.ts'
import { newListFolderDecksController } from './features/decks/controllers/listFolderDecks.ts'
import { newCreateDeckController } from './features/decks/controllers/createDeck.ts'
import { newGetDeckController } from './features/decks/controllers/getDeck.ts'
import { newUpdateDeckController } from './features/decks/controllers/updateDeck.ts'
import { newDeleteDeckController } from './features/decks/controllers/deleteDeck.ts'
import { newListNotesByDeckController } from './features/notes/controllers/listNotesByDeck.ts'
import { newCreateNoteController } from './features/notes/controllers/createNote.ts'
import { newGetNoteController } from './features/notes/controllers/getNote.ts'
import { newUpdateNoteController } from './features/notes/controllers/updateNote.ts'
import { newDeleteNoteController } from './features/notes/controllers/deleteNote.ts'
import { newStartReviewSessionController } from './features/review/controllers/startReviewSession.ts'
import { newGetReviewSessionController } from './features/review/controllers/getReviewSession.ts'
import { newGradeReviewSessionCardController } from './features/review/controllers/gradeReviewSessionCard.ts'
import { newGetSettingsController } from './features/settings/controllers/getSettings.ts'
import { newUpdateSettingsController } from './features/settings/controllers/updateSettings.ts'
import { newGetDefaultSettingsController } from './features/settings/controllers/getDefaultSettings.ts'
import { newResetSettingsController } from './features/settings/controllers/resetSettings.ts'
import { newGetTrashController } from './features/trash/controllers/getTrash.ts'
import { newEmptyTrashController } from './features/trash/controllers/emptyTrash.ts'
import { newRestoreTrashItemController } from './features/trash/controllers/restoreTrashItem.ts'
import { newDeleteTrashItemController } from './features/trash/controllers/deleteTrashItem.ts'
import { newSearchContentController } from './features/search/controllers/searchContent.ts'

export type ProductMockControllers = ClearWebApiGeneratedMockControllers
export type MockApiControllers = ProductMockControllers & AdminGeneratedMockControllers
export type { MockApiDependencies }

export const newMockApiControllers = async (
  options: MockStateOptions = {},
): Promise<MockApiControllers> => {
  const stateStore = await newFileMockStateStore(options)
  const deps = newMockApiDependencies(stateStore)

  return {
    ...newBootstrapController(deps),
    ...newListWorkspacesController(deps),
    ...newCreateWorkspaceController(deps),
    ...newGetActiveWorkspaceController(deps),
    ...newSetActiveWorkspaceController(deps),
    ...newGetWorkspaceController(deps),
    ...newUpdateWorkspaceController(deps),
    ...newDeleteWorkspaceController(deps),
    ...newListWorkspaceFoldersController(deps),
    ...newListFolderFoldersController(deps),
    ...newCreateFolderController(deps),
    ...newGetFolderController(deps),
    ...newUpdateFolderController(deps),
    ...newDeleteFolderController(deps),
    ...newGetFolderPathController(deps),
    ...newListWorkspaceDecksController(deps),
    ...newListFolderDecksController(deps),
    ...newCreateDeckController(deps),
    ...newGetDeckController(deps),
    ...newUpdateDeckController(deps),
    ...newDeleteDeckController(deps),
    ...newListNotesByDeckController(deps),
    ...newCreateNoteController(deps),
    ...newGetNoteController(deps),
    ...newUpdateNoteController(deps),
    ...newDeleteNoteController(deps),
    ...newStartReviewSessionController(deps),
    ...newGetReviewSessionController(deps),
    ...newGradeReviewSessionCardController(deps),
    ...newGetSettingsController(deps),
    ...newUpdateSettingsController(deps),
    ...newGetDefaultSettingsController(deps),
    ...newResetSettingsController(deps),
    ...newGetTrashController(deps),
    ...newEmptyTrashController(deps),
    ...newRestoreTrashItemController(deps),
    ...newDeleteTrashItemController(deps),
    ...newSearchContentController(deps),
    ...newAdminStateControllers(stateStore, clearWebApiGeneratedRouteDefinitions.length),
  } as MockApiControllers
}

export const newMemoryMockApiControllers = async (
  initialState: MockState = seedState(),
): Promise<MockApiControllers> => newMockApiControllers({ initialState })

const newAdminStateControllers = (
  stateStore: MockStateStore,
  operationCount: number,
): AdminGeneratedMockControllers => ({
  mockGetSnapshot: () => stateStore.snapshot(),
  mockGetState: () => stateStore.snapshot(),
  mockHealth: () => ({
    ok: true,
    operationCount,
  }),
  mockPostSnapshot: ({ body }) => stateStore.replace(body as MockState),
  mockPutClock: ({ body }) => stateStore.setClock((body as MockClock).now),
  mockPutState: ({ body }) => stateStore.replace(body as MockState),
  mockResetState: () => stateStore.reset(),
})
