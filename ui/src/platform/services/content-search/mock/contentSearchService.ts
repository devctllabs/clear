import type { ContentSearchService } from '@features/content-search/services/contentSearchService'
import { ok } from '@shared/errors'
import { mockAppDataStore } from '@platform/mock/mockAppDataStore'

export const mockContentSearchService: ContentSearchService = {
  async search(scope, query) {
    return ok(mockAppDataStore.search(scope, query))
  },
}
