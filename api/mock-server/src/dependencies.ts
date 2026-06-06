import { DeckRepository } from './features/decks/repository.ts'
import { DeckService } from './features/decks/service.ts'
import { FolderRepository } from './features/folders/repository.ts'
import { FolderService } from './features/folders/service.ts'
import { LocationPathResolver } from './features/location-path/resolver.ts'
import { NotesRepository } from './features/notes/repository.ts'
import { NotesService } from './features/notes/service.ts'
import { ReviewRepository } from './features/review/repository.ts'
import { ReviewService } from './features/review/service.ts'
import { SearchService } from './features/search/service.ts'
import { SettingsRepository } from './features/settings/repository.ts'
import { SettingsService } from './features/settings/service.ts'
import { TrashRepository } from './features/trash/repository.ts'
import { TrashService } from './features/trash/service.ts'
import { WorkspaceRepository } from './features/workspaces/repository.ts'
import { WorkspacesService } from './features/workspaces/service.ts'
import type { MockStateStore } from './lib/stateStore.ts'

export type MockApiDependencies = {
  stateStore: MockStateStore
  workspacesService: WorkspacesService
  foldersService: FolderService
  decksService: DeckService
  notesService: NotesService
  reviewService: ReviewService
  settingsService: SettingsService
  trashService: TrashService
  searchService: SearchService
}

export const newMockApiDependencies = (
  stateStore: MockStateStore,
): MockApiDependencies => {
  const workspacesRepository = new WorkspaceRepository(stateStore)
  const foldersRepository = new FolderRepository(stateStore)
  const decksRepository = new DeckRepository(stateStore)
  const notesRepository = new NotesRepository(stateStore)
  const reviewRepository = new ReviewRepository(stateStore)
  const settingsRepository = new SettingsRepository(stateStore)
  const trashRepository = new TrashRepository(stateStore)
  const paths = new LocationPathResolver(
    workspacesRepository,
    foldersRepository,
    decksRepository,
  )
  const settingsService = new SettingsService(settingsRepository, stateStore)
  const notesService = new NotesService(
    notesRepository,
    decksRepository,
    workspacesRepository,
    trashRepository,
    paths,
    stateStore,
  )
  const workspacesService = new WorkspacesService(
    workspacesRepository,
    foldersRepository,
    decksRepository,
    notesRepository,
    trashRepository,
    paths,
    stateStore,
  )
  const foldersService = new FolderService(
    foldersRepository,
    workspacesRepository,
    decksRepository,
    notesRepository,
    trashRepository,
    paths,
    stateStore,
  )
  const decksService = new DeckService(
    decksRepository,
    workspacesRepository,
    foldersRepository,
    notesRepository,
    trashRepository,
    paths,
    stateStore,
  )
  const reviewService = new ReviewService(
    reviewRepository,
    notesRepository,
    decksRepository,
    notesService,
    stateStore,
  )
  const trashService = new TrashService(
    trashRepository,
    workspacesRepository,
    foldersRepository,
    decksRepository,
    notesRepository,
    paths,
    stateStore,
  )
  const searchService = new SearchService(
    workspacesRepository,
    foldersRepository,
    decksRepository,
    notesRepository,
    paths,
  )

  return {
    stateStore,
    workspacesService,
    foldersService,
    decksService,
    notesService,
    reviewService,
    settingsService,
    trashService,
    searchService,
  }
}
