# Clear Mock API Behavior

This sidecar was reconstructed from the current `api/mock-server` implementation.
The feature services, repositories, and seed files are the behavior source of truth.

## operation:bootstrap

Status: inferred

Return a desktop/web runtime profile without mutating state.

## operation:listWorkspaces

Status: inferred

Return visible workspaces and the active workspace id. If the stored active workspace is missing or deleted, return `null` for the active id.

## operation:createWorkspace

Status: inferred

Create a visible workspace with a counter-based `workspace` id and the current mock clock timestamp. Reject duplicate visible workspace titles with conflict.

## operation:getActiveWorkspace

Status: inferred

Return the active workspace id after requiring that the referenced workspace still exists and is visible.

## operation:setActiveWorkspace

Status: inferred

Require the target workspace to exist and be visible, then update the singleton active workspace slice.

## operation:deleteWorkspace

Status: inferred

Soft-delete the workspace and all visible descendant folders, decks, and notes. Add trash entries with location paths for each deleted item. If the deleted workspace was active, switch to the first remaining visible workspace when one exists.

## operation:getWorkspace

Status: inferred

Return the requested visible workspace or a not-found domain error.

## operation:updateWorkspace

Status: inferred

Require the visible workspace, reject duplicate visible titles, then update title, description, icon, and `updatedAt` from the mock clock.

## operation:listWorkspaceFolders

Status: inferred

Require the visible workspace and return visible top-level folders for that workspace. Support `sortField=title|updated` and `sortDirection=asc|desc`, defaulting to insertion order when no supported sort field is provided.

## operation:listWorkspaceDecks

Status: inferred

Require the visible workspace and return visible top-level decks for that workspace. Support `sortField=dueToday|title|updated` and `sortDirection=asc|desc`, defaulting to insertion order when no supported sort field is provided.

## operation:createFolder

Status: inferred

Create a visible folder under a workspace or folder parent using a counter-based `folder` id and the mock clock timestamp. Reject duplicate visible folder names within the same parent. Touch affected folder ancestors and workspace.

## operation:deleteFolder

Status: inferred

Soft-delete the folder, all descendant folders, descendant decks, and descendant notes. Add trash entries with location paths for each deleted item, then touch affected ancestors and workspace.

## operation:getFolder

Status: inferred

Return the requested visible folder or a not-found domain error.

## operation:updateFolder

Status: inferred

Require the visible folder and next parent, reject duplicate visible names in the target parent, update folder fields and `updatedAt`, then touch old and new ancestors/workspaces as needed.

## operation:listFolderFolders

Status: inferred

Require the visible folder and return visible child folders. Support `sortField=title|updated` and `sortDirection=asc|desc`.

## operation:listFolderDecks

Status: inferred

Require the visible folder and return visible child decks. Support `sortField=dueToday|title|updated` and `sortDirection=asc|desc`.

## operation:getFolderPath

Status: inferred

Require the visible folder and return display path segments from workspace through ancestor folders.

## operation:createDeck

Status: inferred

Create a visible deck under a workspace or folder parent using a counter-based `deck` id. Initialize `dueToday`, `progress`, and `totalNotes` to zero, set timestamps from the mock clock, reject duplicate visible deck titles in the same parent, and touch ancestors/workspace.

## operation:deleteDeck

Status: inferred

Soft-delete the deck and all visible notes in the deck. Add trash entries with location paths for the deck and deleted notes, then touch affected ancestors/workspace.

## operation:getDeck

Status: inferred

Return the requested visible deck or a not-found domain error.

## operation:updateDeck

Status: inferred

Require the visible deck and next parent, reject duplicate visible titles in the target parent, update deck fields and `updatedAt`, then touch old and new ancestors/workspaces as needed.

## operation:listNotesByDeck

Status: inferred

Require the visible deck and return visible note list items for that deck. Support `sortField=title|updated` and `sortDirection=asc|desc`.

## operation:createNote

Status: inferred

Require the visible deck, create a note with a counter-based `note` id and mock clock timestamps, and recompute deck stats. Basic notes produce one review card using the note id. Cloze notes derive cards from `{{cN::...}}` markers, or create a default `c1` card when no marker exists, using counter-based `card` ids.

## operation:deleteNote

Status: inferred

Soft-delete the visible note, add a trash entry with its location path, and recompute the parent deck stats.

## operation:getNote

Status: inferred

Return the requested visible note detail or a not-found domain error.

## operation:updateNote

Status: inferred

Require the existing visible note and target visible deck, rebuild the note detail from the draft while preserving the note id, derive new cloze cards with counter-based `card` ids when needed, update timestamps, and recompute old and new deck stats.

## operation:startReviewSession

Status: inferred

Require the visible deck and build a queue from visible deck notes/cards. If no cards exist, return unavailable with `empty-deck`. If due cards exist, create a due session with planned count and first due card. Otherwise create a practice session with the first card. Use a counter-based `review` id and mock clock timestamps.

## operation:getReviewSession

Status: inferred

Return the requested review session or a not-found domain error.

## operation:gradeReviewSessionCard

Status: inferred

Require the session and current card. Reject grading a non-current card with conflict. Apply grade progress changes to the underlying note/card, schedule next due date from the mock clock, recompute deck stats, update session duration/reviewed count, complete due sessions when planned/due cards are exhausted, and cycle practice sessions through the queue.

## operation:getSettings

Status: inferred

Return the current settings singleton.

## operation:updateSettings

Status: inferred

Replace the settings singleton with the request body inside a state transaction.

## operation:getDefaultSettings

Status: inferred

Return the feature default settings without mutating state.

## operation:resetSettings

Status: inferred

Replace the settings singleton with the feature default settings inside a state transaction.

## operation:emptyTrash

Status: inferred

Permanently remove every underlying record referenced by trash items, clear the trash item list, and update `lastEmptiedAt` from the mock clock.

## operation:getTrash

Status: inferred

Return the trash singleton.

## operation:restoreTrashItem

Status: inferred

Require the trash item, restore the matching soft-deleted workspace, folder, deck, or note when its parent context still exists and no visible duplicate conflicts exist. Touch restored records and affected ancestors/workspaces, recompute deck stats for restored decks/notes, then remove the trash item.

## operation:deleteTrashItem

Status: inferred

Require the trash item, permanently remove the underlying record, then remove the trash item.

## operation:searchContent

Status: inferred

Trim the query and search visible folders, decks, and notes within the requested workspace, folder subtree, or deck scope. Match case-insensitively against folder/deck title and description, basic note title/front/back, and cloze note title/body. Sort each result group by `updatedAt` descending and include location paths.
