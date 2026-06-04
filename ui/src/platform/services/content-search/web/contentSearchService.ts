import { searchContent as apiSearchContent } from '@api-generated/clear-api'
import type {
  SearchResultGroup as ApiSearchResultGroup,
  SearchScope as ApiSearchScope,
} from '@api-generated/clear-api'

import type { ContentSearchService } from '@features/content-search/services/contentSearchService'
import type {
  DeckSearchResult,
  FolderSearchResult,
  NoteSearchResult,
  SearchResultGroup,
} from '@features/content-search/types/search.types'
import { toDomainResult } from '@shared/services/api/sdk-result'

export const webContentSearchService: ContentSearchService = {
  search(scope, query) {
    return toDomainResult(
      apiSearchContent({
        body: {
          query,
          scope: scope as ApiSearchScope,
        },
      }),
      (groups) => groups.map(toSearchResultGroup),
      'Failed to search content.',
    )
  },
}

const toSearchResultGroup = (
  group: ApiSearchResultGroup,
): SearchResultGroup => {
  if (group.kind === 'folder') {
    const results: FolderSearchResult[] = group.results.map((result) => ({
      id: result.id,
      kind: 'folder',
      locationPath: result.locationPath,
      title: result.title,
      updatedAt: result.updatedAt,
      workspaceId: result.workspaceId,
    }))

    return {
      kind: 'folder',
      results,
    }
  }

  if (group.kind === 'deck') {
    const results: DeckSearchResult[] = group.results.map((result) => ({
      deckIcon: result.deckIcon as DeckSearchResult['deckIcon'],
      id: result.id,
      kind: 'deck',
      locationPath: result.locationPath,
      title: result.title,
      updatedAt: result.updatedAt,
      workspaceId: result.workspaceId,
    }))

    return {
      kind: 'deck',
      results,
    }
  }

  const results: NoteSearchResult[] = group.results.map((result) => ({
    deckId: result.deckId,
    id: result.id,
    kind: 'note',
    locationPath: result.locationPath,
    noteKind: result.noteKind,
    title: result.title,
    updatedAt: result.updatedAt,
    workspaceId: result.workspaceId,
  }))

  return {
    kind: 'note',
    results,
  }
}
