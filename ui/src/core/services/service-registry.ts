import type { BootstrapService } from '@features/bootstrap'
import type { ContentSearchService } from '@features/content-search/services/contentSearchService'
import type { DeckService } from '@features/decks/services/deckService'
import type { FolderService } from '@features/folders/services/folderService'
import type { NoteService } from '@features/notes/services/noteService'
import type { ReviewService } from '@features/review/services/reviewService'
import type { TrashService } from '@features/trash/services/trashService'
import type { SettingsService } from '@features/settings/services/settingsService'
import type { WorkspaceService } from '@features/workspaces/services/workspaceService'
import { getConfiguredServiceMode, getRuntimeKind, resolveServiceMode } from '@platform/runtime'
import type { ResolvedServiceMode, RuntimeKind, ServiceMode } from '@platform/runtime'
import { mockBootstrapService } from '@platform/services/bootstrap/mock/bootstrapService'
import { tauriBootstrapService } from '@platform/services/bootstrap/tauri/bootstrapService'
import { webBootstrapService } from '@platform/services/bootstrap/web/bootstrapService'
import { mockContentSearchService } from '@platform/services/content-search/mock/contentSearchService'
import { tauriContentSearchService } from '@platform/services/content-search/tauri/contentSearchService'
import { webContentSearchService } from '@platform/services/content-search/web/contentSearchService'
import { mockDeckService } from '@platform/services/decks/mock/deckService'
import { tauriDeckService } from '@platform/services/decks/tauri/deckService'
import { webDeckService } from '@platform/services/decks/web/deckService'
import { mockFolderService } from '@platform/services/folders/mock/folderService'
import { tauriFolderService } from '@platform/services/folders/tauri/folderService'
import { webFolderService } from '@platform/services/folders/web/folderService'
import { mockNoteService } from '@platform/services/notes/mock/noteService'
import { tauriNoteService } from '@platform/services/notes/tauri/noteService'
import { webNoteService } from '@platform/services/notes/web/noteService'
import { mockReviewService } from '@platform/services/review/mock/reviewService'
import { tauriReviewService } from '@platform/services/review/tauri/reviewService'
import { webReviewService } from '@platform/services/review/web/reviewService'
import { mockTrashService } from '@platform/services/trash/mock/trashService'
import { tauriTrashService } from '@platform/services/trash/tauri/trashService'
import { webTrashService } from '@platform/services/trash/web/trashService'
import { mockSettingsService } from '@platform/services/settings/mock/settingsService'
import { tauriSettingsService } from '@platform/services/settings/tauri/settingsService'
import { webSettingsService } from '@platform/services/settings/web/settingsService'
import { mockWorkspaceService } from '@platform/services/workspaces/mock/workspaceService'
import { tauriWorkspaceService } from '@platform/services/workspaces/tauri/workspaceService'
import { webWorkspaceService } from '@platform/services/workspaces/web/workspaceService'

export type AppServices = {
  bootstrap: BootstrapService
  configuredMode: ServiceMode
  contentSearch: ContentSearchService
  decks: DeckService
  folders: FolderService
  mode: ResolvedServiceMode
  notes: NoteService
  review: ReviewService
  runtime: RuntimeKind
  trash: TrashService
  settings: SettingsService
  workspaces: WorkspaceService
}

const serviceFactories = {
  mock: () => ({
    bootstrap: mockBootstrapService,
    contentSearch: mockContentSearchService,
    decks: mockDeckService,
    folders: mockFolderService,
    notes: mockNoteService,
    review: mockReviewService,
    trash: mockTrashService,
    settings: mockSettingsService,
    workspaces: mockWorkspaceService,
  }),
  tauri: () => ({
    bootstrap: tauriBootstrapService,
    contentSearch: tauriContentSearchService,
    decks: tauriDeckService,
    folders: tauriFolderService,
    notes: tauriNoteService,
    review: tauriReviewService,
    trash: tauriTrashService,
    settings: tauriSettingsService,
    workspaces: tauriWorkspaceService,
  }),
  web: () => ({
    bootstrap: webBootstrapService,
    contentSearch: webContentSearchService,
    decks: webDeckService,
    folders: webFolderService,
    notes: webNoteService,
    review: webReviewService,
    trash: webTrashService,
    settings: webSettingsService,
    workspaces: webWorkspaceService,
  }),
}

export const createAppServices = (
  mode: ServiceMode = getConfiguredServiceMode(),
): AppServices => {
  const resolvedMode = resolveServiceMode(mode)

  return {
    configuredMode: mode,
    mode: resolvedMode,
    runtime: getRuntimeKind(),
    ...serviceFactories[resolvedMode](),
  }
}

export type { ResolvedServiceMode, RuntimeKind, ServiceMode }
