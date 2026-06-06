import type { ContentSearchService } from '@features/content-search/services/contentSearchService'
import type { SearchResultGroup } from '@features/content-search/types/search.types'
import { mockApi } from '@platform/mock/mockApi'
import { toMockDomainResult } from '@platform/mock/mockDomainResult'

export const mockContentSearchService: ContentSearchService = {
  async search(scope, query) {
    return toMockDomainResult(
      () => mockApi.searchService.searchContent({ query, scope }),
      (groups) => groups as SearchResultGroup[],
    )
  },
}
