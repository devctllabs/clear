// Generated starter from .mockapi/profile.toml.
// This file is reviewable scaffold and may be edited.

import {
  generatedRouteDefinitions as clearWebApiGeneratedRouteDefinitions,
  type GeneratedMockControllers as ClearWebApiGeneratedMockControllers,
} from './generated/clear-web-api/mock-runtime.ts'
import type { GeneratedMockControllers as AdminGeneratedMockControllers } from './generated/mock-admin/mock-runtime.ts'
import { newAdminStateController } from './generated/mock-admin/state/controller.ts'
import { MockStateRepository, type MockStateOptions } from './generated/mock-admin/state/repository.ts'
import { AdminStateService } from './generated/mock-admin/state/service.ts'
import { seedState } from './generated/mock-admin/state/seed.ts'
import type { MockState } from './generated/mock-admin/contract/index.ts'
import { WorkspaceRepository } from './features/workspaces/repository.ts'
import { FolderRepository } from './features/folders/repository.ts'
import { DeckRepository } from './features/decks/repository.ts'
import { NotesRepository } from './features/notes/repository.ts'
import { ReviewRepository } from './features/review/repository.ts'
import { SettingsRepository } from './features/settings/repository.ts'
import { TrashRepository } from './features/trash/repository.ts'
import { LocationPathResolver } from './features/location-path/resolver.ts'
import { WorkspacesService } from './features/workspaces/service.ts'
import { FolderService } from './features/folders/service.ts'
import { DeckService } from './features/decks/service.ts'
import { NotesService } from './features/notes/service.ts'
import { ReviewService } from './features/review/service.ts'
import { SettingsService } from './features/settings/service.ts'
import { TrashService } from './features/trash/service.ts'
import { SearchService } from './features/search/service.ts'
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
export type MockApiDependencies = {
  stateRepository: MockStateRepository
  workspacesService: WorkspacesService
  foldersService: FolderService
  decksService: DeckService
  notesService: NotesService
  reviewService: ReviewService
  settingsService: SettingsService
  trashService: TrashService
  searchService: SearchService
}

export const newMockApiControllers = (
  options: MockStateOptions = {},
): MockApiControllers => {
  const stateRepository = new MockStateRepository(options)
  const workspacesRepository = new WorkspaceRepository(stateRepository)
  const foldersRepository = new FolderRepository(stateRepository)
  const decksRepository = new DeckRepository(stateRepository)
  const notesRepository = new NotesRepository(stateRepository)
  const reviewRepository = new ReviewRepository(stateRepository)
  const settingsRepository = new SettingsRepository(stateRepository)
  const trashRepository = new TrashRepository(stateRepository)
  const paths = new LocationPathResolver(workspacesRepository, foldersRepository, decksRepository)
  const settingsService = new SettingsService(settingsRepository, stateRepository)
  const notesService = new NotesService(
    notesRepository,
    decksRepository,
    workspacesRepository,
    trashRepository,
    paths,
    stateRepository,
  )
  const workspacesService = new WorkspacesService(
    workspacesRepository,
    foldersRepository,
    decksRepository,
    notesRepository,
    trashRepository,
    paths,
    stateRepository,
  )
  const foldersService = new FolderService(
    foldersRepository,
    workspacesRepository,
    decksRepository,
    notesRepository,
    trashRepository,
    paths,
    stateRepository,
  )
  const decksService = new DeckService(
    decksRepository,
    workspacesRepository,
    foldersRepository,
    notesRepository,
    trashRepository,
    paths,
    stateRepository,
  )
  const reviewService = new ReviewService(
    reviewRepository,
    notesRepository,
    decksRepository,
    notesService,
    stateRepository,
  )
  const trashService = new TrashService(
    trashRepository,
    workspacesRepository,
    foldersRepository,
    decksRepository,
    notesRepository,
    paths,
    stateRepository,
  )
  const searchService = new SearchService(
    workspacesRepository,
    foldersRepository,
    decksRepository,
    notesRepository,
    paths,
  )
  const deps: MockApiDependencies = {
    stateRepository,
    workspacesService,
    foldersService,
    decksService,
    notesService,
    reviewService,
    settingsService,
    trashService,
    searchService,
  }
  const adminStateService = new AdminStateService(stateRepository, clearWebApiGeneratedRouteDefinitions.length)

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
    ...newAdminStateController(adminStateService),
  } as MockApiControllers
}

export const newMemoryMockApiControllers = (
  initialState: MockState = seedState(),
): MockApiControllers => newMockApiControllers({ initialState })
