import { useQuery } from '@tanstack/react-query'

import { unwrapDomainResult } from '@core/query/domain-query'
import { useServices } from '@core/services'

import type { SearchScope } from '../types/search.types'

export const useContentSearch = (scope: SearchScope, query: string) => {
  const { contentSearch } = useServices()
  const trimmedQuery = query.trim()

  return useQuery({
    enabled: trimmedQuery.length > 0,
    queryKey: ['content-search', scope, trimmedQuery],
    queryFn: () => unwrapDomainResult(contentSearch.search(scope, trimmedQuery)),
  })
}
