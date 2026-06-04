import type { VisualIconName } from '@shared/components/icons/IconGlyph'
import type { NoteKind } from '@features/notes'

export type SearchScope =
  | {
      kind: 'workspace'
      workspaceId: string
    }
  | {
      folderId: string
      kind: 'folder'
    }
  | {
      deckId: string
      kind: 'deck'
    }

type SearchResultBase = {
  id: string
  locationPath: string[]
  title: string
  updatedAt: string
}

export type FolderSearchResult = SearchResultBase & {
  kind: 'folder'
  workspaceId: string
}

export type DeckSearchResult = SearchResultBase & {
  deckIcon: VisualIconName
  kind: 'deck'
  workspaceId: string
}

export type NoteSearchResult = SearchResultBase & {
  deckId: string
  kind: 'note'
  noteKind: NoteKind
  workspaceId: string
}

export type SearchResult = FolderSearchResult | DeckSearchResult | NoteSearchResult

export type FolderSearchResultGroup = {
  kind: 'folder'
  results: FolderSearchResult[]
}

export type DeckSearchResultGroup = {
  kind: 'deck'
  results: DeckSearchResult[]
}

export type NoteSearchResultGroup = {
  kind: 'note'
  results: NoteSearchResult[]
}

export type SearchResultGroup =
  | FolderSearchResultGroup
  | DeckSearchResultGroup
  | NoteSearchResultGroup
