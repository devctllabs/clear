export { newMockApiDependencies, type MockApiDependencies } from './dependencies.ts'
export {
  newBrowserMockStateStore,
  type BrowserMockStateStoreOptions,
} from './lib/browserStateStore.ts'
export { DEFAULT_SETTINGS } from './features/settings/defaults.ts'
export { seedState } from './generated/mock-admin/state/seed.ts'
export { zMockState } from './generated/mock-admin/contract/zod.gen.ts'
export type { MockState, SettingsRecord } from './generated/mock-admin/contract/index.ts'
export type {
  Deck,
  DeckDraft,
  Folder,
  FolderDraft,
  NoteDetail,
  NoteDraft,
  NoteListItem,
  NoteRef,
  ReviewGrade,
  ReviewSession,
  ReviewStartResult,
  SearchRequest,
  SearchResultGroup,
  Settings,
  TrashState,
  Workspace,
  WorkspaceDraft,
  WorkspaceListResult,
} from './generated/clear-web-api/contract/types.gen.ts'
export { MockHttpError } from './generated/clear-web-api/mock-runtime.ts'
export type { MockStateStore } from './lib/stateStore.ts'
