import type { DomainResult } from '@shared/errors'

import type { SearchResultGroup, SearchScope } from '../types/search.types'

export interface ContentSearchService {
  search(scope: SearchScope, query: string): DomainResult<SearchResultGroup[]>
}
